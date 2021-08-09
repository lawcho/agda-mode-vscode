module Error = Connection__Error
module Scheduler = Connection__Scheduler
module Emacs = Connection__Emacs
module LSP = Connection__LSP

module type Module = {
  type version = string
  type status = Emacs(version, string) | LSP(version, LanguageServerMule.Method.t)
  // lifecycle
  let start: (string, bool) => Promise.t<result<status, Error.t>>
  let stop: unit => Promise.t<unit>
  // messaging
  let sendRequest: (
    string,
    bool,
    VSCode.TextDocument.t,
    Request.t,
    result<Response.t, Error.t> => Promise.t<unit>,
  ) => Promise.t<result<status, Error.t>>
}

module Module: Module = {
  // internal state singleton
  type connection = Emacs(Emacs.t) | LSP(LSP.t)
  let singleton: ref<option<connection>> = ref(None)

  type version = string
  type status = Emacs(version, string) | LSP(version, LanguageServerMule.Method.t)

  // connection -> status
  let toStatus = (conn: connection): status =>
    switch conn {
    | LSP(conn) => LSP(conn.version, LanguageServerMule.Client.LSP.getMethod(conn.client))
    | Emacs(conn) =>
      let (version, path) = Emacs.getInfo(conn)
      Emacs(version, path)
    }

  let start = (globalStoragePath, useLSP) =>
    switch singleton.contents {
    | Some(conn) => Promise.resolved(Ok(toStatus(conn)))
    | None =>
      if useLSP {
        Connection__Probe.probeLSP(globalStoragePath, _ => ())
        ->Promise.flatMap(((result, errors)) =>
          switch result {
          | None =>
            Promise.resolved(Error(Error.CannotAcquireHandle("Agda Language Server", errors)))
          | Some(method) => Promise.resolved(Ok(method))
          }
        )
        ->Promise.flatMapOk(method => {
          LSP.Client.make("agda", "Agda Language Server", method)
          ->Promise.mapError(e => LSP.Error.ConnectionError(e))
          ->Promise.flatMapOk(LSP.make)
          ->Promise.mapError(error => Error.LSP(error))
        })
        ->Promise.mapOk(conn => {
          let (version, method) = (
            conn.version,
            LanguageServerMule.Client.LSP.getMethod(conn.client),
          )
          singleton := Some(LSP(conn))
          LSP(version, method)
        })
      } else {
        Connection__Probe.probeEmacs()
        ->Promise.flatMap(((result, errors)) =>
          switch result {
          | None => Promise.resolved(Error(Error.CannotAcquireHandle("Agda", errors)))
          | Some(method) => Promise.resolved(Ok(method))
          }
        )
        ->Promise.flatMapOk(method =>
          Emacs.make(method)->Promise.mapError(error => Error.Emacs(error))
        )
        ->Promise.mapOk(conn => {
          singleton := Some(Emacs(conn))
          let (version, path) = Emacs.getInfo(conn)
          Emacs(version, path)
        })
      }
    }

  let stop = () =>
    switch singleton.contents {
    | Some(LSP(conn)) =>
      singleton := None
      LSP.destroy(conn)
    | Some(Emacs(conn)) =>
      singleton := None
      Emacs.destroy(conn)
    | None => Promise.resolved()
    }

  let rec sendRequest = (globalStoragePath, useLSP, document, request, handler) => {
    // encode the Request to some string
    let encodeRequest = (document, version) => {
      let filepath = document->VSCode.TextDocument.fileName->Parser.filepath
      let libraryPath = Config.getLibraryPath()
      let highlightingMethod = Config.Highlighting.getHighlightingMethod()
      let backend = Config.getBackend()
      Request.encode(document, version, filepath, backend, libraryPath, highlightingMethod, request)
    }

    switch singleton.contents {
    | Some(LSP(conn)) =>
      let handler = x => x->Util.Result.mapError(err => Error.LSP(err))->handler
      LSP.sendRequest(conn, encodeRequest(document, conn.version), handler)
      ->Promise.mapOk(() => toStatus(LSP(conn)))
      ->Promise.flatMapError(error => {
        // stop the connection on error
        stop()->Promise.map(() => Error(Error.LSP(error)))
      })

    | Some(Emacs(conn)) =>
      let (version, _path) = Emacs.getInfo(conn)
      let handler = x => x->Util.Result.mapError(err => Error.Emacs(err))->handler
      Emacs.sendRequest(conn, encodeRequest(document, version), handler)
      ->Promise.mapOk(() => toStatus(Emacs(conn)))
      ->Promise.flatMapError(error => {
        // stop the connection on error
        stop()->Promise.map(() => Error(Error.Emacs(error)))
      })
    | None =>
      start(globalStoragePath, useLSP)->Promise.flatMapOk(_ =>
        sendRequest(globalStoragePath, useLSP, document, request, handler)
      )
    }
  }
}

include Module