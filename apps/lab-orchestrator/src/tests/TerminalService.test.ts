import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TerminalService } from '../services/TerminalService';

const mocks = vi.hoisted(() => ({
    getContainer: vi.fn()
}));

vi.mock('../config/env', () => ({
    config: {
        dockerSocket: '/var/run/docker.sock',
        networkName: 'devio-lab-network',
        minio: { endpoint: 'http://localhost' }
    }
}));

vi.mock('dockerode', () => {
    const DockerMock = function() { return mocks; };
    return { default: DockerMock };
});
vi.mock('../utils/logger');


describe('TerminalService Unit Tests', () => {
    let mockContainer: any;
    let mockWs: any;

    beforeEach(() => {
        vi.useFakeTimers();

        mockWs = {
            send: vi.fn(),
            close: vi.fn(),
            on: vi.fn(),
            readyState: 1
        };

        const mockStream = {
            on: vi.fn(),
            write: vi.fn(),
            end: vi.fn(),
            destroy: vi.fn()
        };

        mockContainer = {
            exec: vi.fn().mockImplementation(async () => {
                return {
                    start: vi.fn().mockResolvedValue(mockStream),
                    resize: vi.fn().mockResolvedValue({})
                };
            })
        };

        mocks.getContainer.mockReturnValue(mockContainer);
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.clearAllMocks();
    });

    it('should successfully establish connection using the first available shell (/bin/bash)', async () => {
        await TerminalService.handleConnection(mockWs, 'test-container');

        expect(mocks.getContainer).toHaveBeenCalledWith('test-container');
        expect(mockContainer.exec).toHaveBeenCalledWith(expect.objectContaining({
            Cmd: ['/bin/bash'],
            Tty: true
        }));
        expect(mockWs.on).toHaveBeenCalledWith('message', expect.any(Function));
    });

    it('should fallback to /bin/sh if /bin/bash fails', async () => {
        mockContainer.exec.mockRejectedValueOnce(new Error('executable file not found in $PATH'));

        await TerminalService.handleConnection(mockWs, 'test-container');

        expect(mockContainer.exec).toHaveBeenCalledTimes(2);
        
        expect(mockContainer.exec.mock.calls[1][0]).toEqual(expect.objectContaining({
            Cmd: ['/bin/sh']
        }));
    });

    it('should close WebSocket if all shell attempts fail', async () => {
        mockContainer.exec.mockRejectedValue(new Error('Fatal error, no shells exist'));

        await TerminalService.handleConnection(mockWs, 'test-container');

        expect(mockContainer.exec).toHaveBeenCalledTimes(4);
        expect(mockWs.send).toHaveBeenCalledWith(expect.stringContaining('[Error] Failed to connect to terminal'));
        expect(mockWs.close).toHaveBeenCalled();
    });

    it('should correctly route WebSocket messages to stream inputs or resize commands', async () => {
        await TerminalService.handleConnection(mockWs, 'test-container');

        const messageHandlerCall = mockWs.on.mock.calls.find((c: any) => c[0] === 'message');
        expect(messageHandlerCall).toBeDefined();
        const wsMessageHandler = messageHandlerCall[1];

        const execOptionsCall = mockContainer.exec.mock.results[0].value;
        const execInstance = await execOptionsCall;
        const streamInstance = await execInstance.start();

        wsMessageHandler(JSON.stringify({ type: 'resize', rows: 40, cols: 100 }));
        expect(execInstance.resize).toHaveBeenCalledWith({ h: 40, w: 100 }, expect.any(Function));

        wsMessageHandler(JSON.stringify({ type: 'data', data: 'ls -l\n' }));
        expect(streamInstance.write).toHaveBeenCalledWith('ls -l\n');

        wsMessageHandler(Buffer.from('clear\n'));
        expect(streamInstance.write).toHaveBeenCalledWith('clear\n');
    });
});
