import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { CheckCircle2, AlertCircle, XCircle, Info, X } from 'lucide-react';

// 弹窗类型
type AlertType = 'success' | 'error' | 'warning' | 'info';

// 弹窗选项
interface AlertOptions {
  title?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  duration?: number; // 自动关闭时间，0表示不自动关闭
}

// 弹窗状态
interface AlertState {
  message: string;
  type: AlertType;
  options: AlertOptions;
  isOpen: boolean;
  resolve?: (value: boolean) => void;
}

// 上下文类型
interface AlertContextType {
  alertState: AlertState;
  setAlertState: React.Dispatch<React.SetStateAction<AlertState>>;
  showAlert: (message: string, type?: AlertType, options?: AlertOptions) => void;
  showConfirm: (message: string, type?: AlertType, options?: AlertOptions) => Promise<boolean>;
}

// 创建上下文
const AlertContext = createContext<AlertContextType | undefined>(undefined);

// 图标映射
const icons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertCircle,
  info: Info
};

// 颜色映射
const colors = {
  success: 'text-emerald-400',
  error: 'text-red-400',
  warning: 'text-amber-400',
  info: 'text-blue-400'
};

// 背景色映射
const bgColors = {
  success: 'bg-emerald-900/30 border-emerald-800/50',
  error: 'bg-red-900/30 border-red-800/50',
  warning: 'bg-amber-900/30 border-amber-800/50',
  info: 'bg-blue-900/30 border-blue-800/50'
};

// 自定义弹窗组件
const CustomAlert: React.FC = () => {
  // 使用上下文获取状态和更新函数
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('CustomAlert must be used within an AlertProvider');
  }
  const { alertState, setAlertState } = context;

  // 自动关闭计时器
  useEffect(() => {
    if (alertState.isOpen && alertState.options.duration && alertState.options.duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, alertState.options.duration);

      return () => clearTimeout(timer);
    }
  }, [alertState.isOpen, alertState.options.duration]);

  // 关闭弹窗
  const handleClose = () => {
    setAlertState(prev => ({
      ...prev,
      isOpen: false
    }));
    // 如果是确认弹窗且未点击确认，则返回false
    if (alertState.resolve && alertState.options.cancelText) {
      alertState.resolve(false);
    }
  };

  // 确认操作
  const handleConfirm = () => {
    if (alertState.options.onConfirm) {
      alertState.options.onConfirm();
    }
    if (alertState.resolve) {
      alertState.resolve(true);
    }
    handleClose();
  };

  // 取消操作
  const handleCancel = () => {
    if (alertState.options.onCancel) {
      alertState.options.onCancel();
    }
    if (alertState.resolve) {
      alertState.resolve(false);
    }
    handleClose();
  };

  // 获取当前类型的图标组件
  const IconComponent = icons[alertState.type];

  return (
    <>
      {alertState.isOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-stone-900 border border-stone-800 rounded-xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95">
            {/* 弹窗内容 */}
            <div className="p-6">
              <div className="flex items-start space-x-4">
                {/* 图标 */}
                <div className={`p-3 rounded-full ${bgColors[alertState.type]}`}>
                  <IconComponent className={`h-6 w-6 ${colors[alertState.type]}`} />
                </div>
                
                {/* 标题和消息 */}
                <div className="flex-1">
                  {alertState.options.title && (
                    <h3 className="text-lg font-bold text-white mb-2">
                      {alertState.options.title}
                    </h3>
                  )}
                  <p className="text-stone-300 whitespace-pre-line">
                    {alertState.message}
                  </p>
                </div>
                
                {/* 关闭按钮 */}
                {!alertState.options.cancelText && (
                  <button 
                    onClick={handleClose}
                    className="text-stone-500 hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            </div>
            
            {/* 按钮区域 */}
            {(alertState.options.cancelText || alertState.options.confirmText) && (
              <div className="flex justify-end space-x-3 p-4 border-t border-stone-800 bg-stone-950/50">
                {alertState.options.cancelText && (
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-white rounded-lg transition-colors"
                  >
                    {alertState.options.cancelText}
                  </button>
                )}
                <button
                  onClick={handleConfirm}
                  className={`px-4 py-2 text-white rounded-lg transition-colors ${colors[alertState.type]}`}
                  style={{
                    backgroundColor: alertState.type === 'success' ? '#10b981' : 
                                      alertState.type === 'error' ? '#ef4444' :
                                      alertState.type === 'warning' ? '#f59e0b' :
                                      '#3b82f6'
                  }}
                >
                  {alertState.options.confirmText || '确认'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

// 弹窗提供者组件
export const AlertProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [alertState, setAlertState] = useState<AlertState>({
    message: '',
    type: 'info',
    options: {},
    isOpen: false
  });

  // 显示信息弹窗
  const showAlert = (message: string, type: AlertType = 'info', options: AlertOptions = {}) => {
    setAlertState({
      message,
      type,
      options: {
        duration: options.duration || 0, // 默认不自动关闭
        ...options
      },
      isOpen: true
    });
  };

  // 显示确认弹窗
  const showConfirm = (message: string, type: AlertType = 'warning', options: AlertOptions = {}): Promise<boolean> => {
    return new Promise((resolve) => {
      setAlertState({
        message,
        type,
        options: {
          duration: 0, // 确认弹窗不自动关闭
          cancelText: '取消',
          confirmText: '确认',
          ...options
        },
        isOpen: true,
        resolve
      });
    });
  };

  return (
    <AlertContext.Provider value={{ alertState, setAlertState, showAlert, showConfirm }}>
      {children}
      <CustomAlert />
    </AlertContext.Provider>
  );
};

// 自定义钩子
export const useAlert = () => {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return { showAlert: context.showAlert, showConfirm: context.showConfirm };
};
