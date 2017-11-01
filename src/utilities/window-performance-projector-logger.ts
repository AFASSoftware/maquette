import { PerformanceLoggerEvent, ProjectorPerformanceLogger } from '../interfaces';

/**
 * A `ProjectorPerformanceLogger` that reports measurements to window.performance.measure
 *
 * Can be passed to `createProjector` to get more insights into the virtual DOM performance.
 */
export let windowPerformanceProjectorLogger: ProjectorPerformanceLogger;

if (window.performance && window.performance.measure) {
  let performance = window.performance;
  let lastMark: PerformanceLoggerEvent | undefined;
  windowPerformanceProjectorLogger = (eventType: PerformanceLoggerEvent, trigger: Event | undefined) => {
    performance.mark(eventType);
    switch (eventType) {
      case 'domEventProcessed':
        performance.measure('eventHandler', 'domEvent', 'domEventProcessed');
        break;
      case 'renderDone':
        performance.measure('renderCycle', 'renderStart', 'renderDone');
        break;
      case 'rendered':
        performance.measure('render', lastMark, 'rendered');
        break;
      case 'patched':
        performance.measure('diff+patch', 'rendered', 'patched');
        break;
    }
    lastMark = eventType;
  };
} else {
  windowPerformanceProjectorLogger = () => undefined;
}
