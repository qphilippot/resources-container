export default class BazClass {
    public configure(service: any): void {
        BazClass.configureStatic(service);
    }

    public static configureStatic(service: any): void {
        if (typeof service?.configure === 'function') {
            service.configure();
        }
    }
}
