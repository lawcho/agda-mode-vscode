module Impl = (Editor: Sig.Editor) => {
  module State = State.Impl(Editor);
  type t =
    | WithState(State.t => Promise.t(list(t)))
    | DispatchCommand(Command.t)
    | Connect
    | SendRequest(Request.t)
    | ViewReq(View.Request.t);
};