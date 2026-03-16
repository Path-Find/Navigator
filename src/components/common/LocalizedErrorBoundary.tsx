import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Logger } from '../../utils/logger';

interface Props {
    children: ReactNode;
    componentName?: string;
}

interface State {
    hasError: boolean;
}

/**
 * LocalizedErrorBoundary
 * Prevents a single component crash from breaking the whole application.
 * Ideal for wrapping list items, widgets, or specific sections.
 */
export class LocalizedErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(): State {
        return { hasError: true };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        Logger.error(`LOCALIZED ERROR [${this.props.componentName || 'Unknown'}]:`, error, errorInfo);
    }

    private handleRetry = () => {
        this.setState({ hasError: false });
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="p-6 bg-rose-50/50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-800/50 rounded-3xl flex flex-col items-center justify-center text-center animate-in fade-in duration-300">
                    <AlertCircle className="w-6 h-6 text-rose-500 mb-2" />
                    <p className="text-sm font-bold text-rose-900 dark:text-rose-100 mb-1">Failed to load {this.props.componentName || 'this section'}</p>
                    <button 
                        onClick={this.handleRetry}
                        className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:opacity-80 transition-opacity"
                    >
                        <RefreshCw className="w-3 h-3" />
                        Retry
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
