/**
 * This is a simple way to pass messages between application components.
 */
import eventify from 'ngraph.events';

const bus = eventify({});
export default bus;