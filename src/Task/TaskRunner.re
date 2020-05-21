module Impl = (Editor: Sig.Editor) => {
  module ErrorHandler = Task__Error.Impl(Editor);
  module TaskCommand = Task__Command.Impl(Editor);
  module TaskResponse = Task__Response.Impl(Editor);
  module Task = Task.Impl(Editor);
  module State = State.Impl(Editor);
  open Belt;

  // Busy if there are Tasks currently being executed, Idle otherwise
  type status =
    | Busy
    | Idle;

  // Task Runner
  type t = {
    // channel for adding Tasks
    taskEmitter: Event.t(Task.t),
    // edge triggered Status emitter
    statusEmitter: Event.t(status),
    mutable status,
  };

  let addTask = (self: t, task) => self.taskEmitter.emit(task);

  let addTasks = (self, tasks) => tasks->List.forEach(addTask(self));

  let runTask = (self, state, task: Task.t): Promise.t(unit) =>
    switch (task) {
    | Task.WithState(callback) =>
      callback(state)->Promise.map(addTasks(self))
    | DispatchCommand(command) =>
      Js.log("[ task ][ command ] " ++ Command.toString(command));
      addTasks(self, TaskCommand.dispatch(command))->Promise.resolved;
    | SendRequest(request) =>
      Js.log("[ task ][ send request ]");

      let (promise, resolve) = Promise.pending();

      let onResponse = (
        fun
        | Error(error) => {
            let tasks = ErrorHandler.handle(Error.Connection(error));
            addTasks(self, tasks);
            resolve();
          }
        | Ok(Parser.Incr.Event.Yield(Error(error))) => {
            let tasks = ErrorHandler.handle(Error.Parser(error));
            addTasks(self, tasks);
            resolve();
          }
        | Ok(Yield(Ok(response))) => {
            Js.log(Response.toString(response));
            let tasks = TaskResponse.handle();
            addTasks(self, tasks);
          }
        | Ok(Stop) => resolve()
      );

      state
      ->State.sendRequest(request)
      ->Promise.flatMap(
          fun
          | Ok(connection) => {
              let destructor = connection.Connection.emitter.on(onResponse);
              // invoke the destructor after the promise is resolved,
              // to stop receiving events regarding this request
              promise->Promise.map(destructor);
            }
          | Error(error) => {
              let tasks = ErrorHandler.handle(error);
              addTasks(self, tasks);
              resolve();
              promise;
            },
        );

    | Connect =>
      Js.log("[ task ][ connect ]");
      state
      ->State.connect
      ->Promise.tapOk(Js.log2("OK"))
      ->Promise.tapError(Js.log2("Error"))
      ->Promise.map(
          fun
          | Error(_) => ()
          | Ok(_) => {
              addTasks(self, [ViewReq(Plain("hey", "ha"))]);
              ();
            },
        );
    // state
    // ->State.sendRequest(request)
    // ->Promise.flatMap(
    //     fun
    //     | Error(error) => {
    //         let (header, body) = Sig.Error.toString(error);
    //         [Task.Display(Error(header), Plain(body))] |> run(state);
    //       }
    //     | Ok(response) => TaskResponse.handle(response) |> run(state),
    //   );
    | ViewReq(request) => state->State.sendRequestToView(request)
    };

  let make = state => {
    // Tasks get classified and queued here
    let taskQueue: array(Task.t) = [||];
    let commandQueue: array(Command.t) = [||];

    let taskEmitter = Event.make();
    let statusEmitter = Event.make();
    let self = {taskEmitter, status: Idle, statusEmitter};

    // see if there are any Tasks in the `taskQueue` or the `commandQueue`
    // Priority: taskQueue > commandQueue;
    let getNextTask = () => {
      let nextTask = Js.Array.shift(taskQueue);
      switch (nextTask) {
      | None =>
        Js.Array.shift(commandQueue)
        ->Option.map(command => Task.DispatchCommand(command))
      | Some(task) => Some(task)
      };
    };

    let rec runTasksInQueues = () => {
      let nextTask = getNextTask();
      switch (nextTask) {
      | None =>
        self.status = Idle;
        self.statusEmitter.emit(Idle);
      | Some(task) =>
        runTask(self, state, task)->Promise.get(runTasksInQueues)
      };
    };

    let _ =
      taskEmitter.on(task => {
        // classify Tasks base on priority
        switch (task) {
        | DispatchCommand(command) =>
          Js.Array.push(command, commandQueue)->ignore
        | otherTask => Js.Array.push(otherTask, taskQueue)->ignore
        };

        // kick start `runTasksInQueues` if it's not already running
        if (self.status == Idle) {
          self.status = Busy;
          self.statusEmitter.emit(Busy);
          runTasksInQueues();
        };
      });

    self;
  };

  // destroy only after all tasks have been executed
  let destroy = (self: t): Promise.t(unit) => {
    let (promise, resolve) = Promise.pending();
    let destroy' = () => {
      self.statusEmitter.destroy();
      self.taskEmitter.destroy();
      resolve();
    };

    switch (self.status) {
    | Idle => destroy'()
    | Busy =>
      let _ =
        self.statusEmitter.on(
          fun
          | Idle => destroy'()
          | Busy => (),
        );
      ();
    };
    promise;
  };
};