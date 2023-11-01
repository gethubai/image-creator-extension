export { default } from './extension';

if (module.hot) {
    module.hot.accept('./extension.tsx', () => {
      // TODO: Find a way to reload the extension components
      console.log('HRM Updated');
    });
  }
  