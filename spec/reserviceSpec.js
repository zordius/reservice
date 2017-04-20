import { ReserviceError, createService } from '../src'

describe('reservice', () => {
    describe('ReserviceError', () => {
        it('should be a standard Error', () => {
            expect(new ReserviceError('test') instanceof Error).toBe(true);
        });

        it('should be a extended Error', () => {
            expect(new ReserviceError('test') instanceof ReserviceError).toBe(true);
        });

        it('should keep action when proviced', () => {
            const action = {type: 'test', payload: 'haha'};
            const err = new ReserviceError('test', action);
            expect(err.action).toBe(action);
        });
    });

    describe('createService()', () => {
        it('should return action creator', () => {
            expect(typeof createService()).toBe('function');
        });

        it('should keep service name in .toString()', () => {
            expect(createService('SERVICE_NAME').toString()).toBe('SERVICE_NAME');
        });

        it('should keep service name in action.meta.serviceName', () => {
            expect(createService('SERVICE_NAME')().meta.serviceName).toBe('SERVICE_NAME');
        });

        it('should provide default payload logic', () => {
            expect(createService('thisIsService')('yo', 'ya')).toEqual({
                type: 'CALL_SERVICE',
                payload: 'yo',
                meta: {
                    serviceName: 'thisIsService',
                    serviceState: 'CREATED'
                }
            });
        });

        it('should handle payload creator correctly', () => {
            const payloadCreator = (arg1, arg2) => {
                return {foo: arg1, bar: arg2};
            };

            expect(createService('SERVICE_NAME', payloadCreator)('yo', 'ya')).toEqual({
                type: 'CALL_SERVICE',
                payload: {
                    foo: 'yo',
                    bar: 'ya'
                },
                meta: {
                    serviceName: 'SERVICE_NAME',
                    serviceState: 'CREATED'
                }
            });
        });
    });
});
