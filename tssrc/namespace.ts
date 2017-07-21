// ## Init
// #### Module definition
// ------------------

// Declare and attach seen namespace
import * as seen from './index';
// tslint:disable-next-line:interface-name
interface Window {
    seen: any;
}
if (typeof window !== "undefined" && window !== null) {
    window.seen = seen;
} // for the web
