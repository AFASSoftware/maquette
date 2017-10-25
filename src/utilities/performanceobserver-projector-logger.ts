import { PerformanceLoggerEvent, ProjectorPerformanceLogger } from '../interfaces';

export let performanceObserverProjectorLogger: ProjectorPerformanceLogger;

if (window.performance && window.performance.measure) {
  let performance = window.performance;
  let lastMark: PerformanceLoggerEvent | undefined;
  performanceObserverProjectorLogger = (eventType: PerformanceLoggerEvent, trigger: Event | undefined) => {
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
        performance.measure('diff+patch', lastMark, 'patched');
        break;
    }
    lastMark = eventType;
  };
} else {
  performanceObserverProjectorLogger = () => undefined;
}
