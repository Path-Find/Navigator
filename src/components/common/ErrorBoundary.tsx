import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.href = '/';
    };

    private handleReload = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            const isChunkError = this.state.error?.message.includes('Failed to fetch dynamically imported module') ||
                this.state.error?.message.includes('Loading chunk');

            return (
                <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center animate-in fade-in zoom-in-95 duration-500">
                    <div className="w-20 h-20 bg-rose-100 dark:bg-rose-900/30 rounded-3xl flex items-center justify-center mx-auto mb-6 text-rose-600 dark:text-rose-400">
                        <AlertCircle className="w-10 h-10" />
                    </div>

                    <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-3">
                        {isChunkError ? 'Update Available' : 'Something Went Wrong'}
                    </h2>
                    <p className="text-neutral-500 dark:text-neutral-400 max-w-md mb-8 leading-relaxed">
                        {isChunkError
                            ? "A new version of Navigator is available. Please reload to continue."
                            : "We encountered an unexpected error. Don't worry, your data is safe."}
                    </p>

                    <div className="flex gap-3">
                        <button
                            onClick={this.handleReload}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl font-semibold hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
                        >
                            <RefreshCw className="w-4 h-4" />
                            {isChunkError ? 'Update Now' : 'Try Reloading'}
                        </button>

                        {!isChunkError && (
                            <button
                                onClick={this.handleReset}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 rounded-xl font-semibold hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all"
                            >
                                <Home className="w-4 h-4" />
                                Return Home
                            </button>
                        )}
                    </div>

                    <div className="mt-8 pt-8 border-t border-neutral-100 dark:border-neutral-800">
                        <p className="text-xs text-neutral-400">
                            If this keeps happening, please try clearing your browser cache or contact support.
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
