// ## Events
// ------------------

// Attribution: these have been adapted from d3.js's event dispatcher
// functions.

export let Events = {
  // Return a new dispatcher that creates event types using the supplied string
  // argument list. The returned `Dispatcher` will have methods with the names
  // of the event types.
  dispatch: (...args: string[]) => {
    const dispatch = new Events$Dispatcher();
    for (const arg of args) {
      dispatch[arg] = Events$Event();
    }
    return dispatch;
  },
};

// The `Dispatcher` class. These objects have methods that can be invoked like
// `dispatch.eventName()`. Listeners can be registered with
// `dispatch.on('eventName.uniqueId', callback)`. Listeners can be removed with
// `dispatch.on('eventName.uniqueId', null)`. Listeners can also be registered
// and removed with `dispatch.eventName.on('name', callback)`.
//
// Note that only one listener with the name event name and id can be
// registered at once. If you to generate unique ids, you can use the
// Util.uniqueId() method.
// tslint:disable-next-line:ban-types
type listenerType = Function;
export type OnDispatcher = (type: string, listener: any) => Events$Dispatcher;
interface IEventOn {
   on(name: string, listener: listenerType): listenerType;
}
export class Events$Dispatcher {
  [key: string]: any;
  public on(type: string, listener: any) {
    const i = type.indexOf('.');
    let name = '';
    if (i > 0) {
      name = type.substring(i + 1);
      type = type.substring(0, i);
    }
    if (this[type] != null) {
      this[type].on(name, listener);
    }
    return this;
  }
}
// Internal event object for storing listener callbacks and a map for easy
// lookup. This method returns a new event object.
// tslint:disable-next-line:class-name

const Events$Event = function() {
  const listenerMap = new Map<string, listenerType>();
  const on = (name: string, listener: listenerType) => {
    if (listener != null) {
      listenerMap.set(name, listener);
    } else {
      listenerMap.delete(name);
    }
  };
  const event = (...args: any[]) => {
    for ( const [name, l] of listenerMap)
    {
      l.apply(this, args);
    }
  };
  event.on  = on;
  event.listenerMap = listenerMap;
  return event;
};
