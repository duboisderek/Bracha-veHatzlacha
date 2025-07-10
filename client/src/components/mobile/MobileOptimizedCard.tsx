import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

interface MobileOptimizedCardProps {
  title?: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  clickable?: boolean;
  compact?: boolean;
  gradient?: boolean;
  icon?: ReactNode;
}

export function MobileOptimizedCard({
  title,
  children,
  className = "",
  onClick,
  clickable = false,
  compact = false,
  gradient = false,
  icon
}: MobileOptimizedCardProps) {
  const cardClasses = `
    ${gradient ? 'bg-gradient-to-br from-blue-50 to-purple-50' : 'bg-white'}
    ${clickable ? 'cursor-pointer hover:shadow-md active:scale-98' : ''}
    ${compact ? 'mobile-card p-3' : 'mobile-card'}
    border border-gray-200 shadow-sm
    ${className}
  `;

  const CardComponent = clickable ? motion.div : Card;
  const cardProps = clickable ? {
    whileTap: { scale: 0.98 },
    onClick,
    className: cardClasses
  } : {
    className: cardClasses
  };

  return (
    <CardComponent {...cardProps}>
      {title && (
        <CardHeader className={compact ? "pb-2" : "pb-4"}>
          <CardTitle className={`flex items-center gap-2 mobile-text-lg ${compact ? 'text-base' : 'text-lg'}`}>
            {icon && <span className="text-blue-600">{icon}</span>}
            {title}
            {clickable && <ChevronRight size={16} className="ml-auto text-gray-400" />}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={compact ? "pt-0" : ""}>
        {children}
      </CardContent>
    </CardComponent>
  );
}

// Card spécialisée pour les stats
export function MobileStatsCard({
  title,
  value,
  subtitle,
  icon,
  color = "blue",
  trend,
  onClick
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  color?: "blue" | "green" | "purple" | "orange" | "red";
  trend?: "up" | "down" | "neutral";
  onClick?: () => void;
}) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600 text-white",
    green: "from-green-500 to-green-600 text-white",
    purple: "from-purple-500 to-purple-600 text-white",
    orange: "from-orange-500 to-orange-600 text-white",
    red: "from-red-500 to-red-600 text-white"
  };

  const trendColors = {
    up: "text-green-600",
    down: "text-red-600",
    neutral: "text-gray-600"
  };

  return (
    <motion.div
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={`
        mobile-card bg-gradient-to-br ${colorClasses[color]}
        ${onClick ? 'cursor-pointer hover:shadow-lg' : ''}
        border-0 shadow-md
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="mobile-text-sm opacity-90 font-medium">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {subtitle && (
            <p className={`mobile-text-sm mt-1 ${trend ? trendColors[trend] : 'opacity-80'}`}>
              {subtitle}
            </p>
          )}
        </div>
        {icon && (
          <div className="opacity-80">
            {icon}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Card pour actions rapides
export function MobileActionCard({
  title,
  description,
  icon,
  action,
  disabled = false,
  variant = "primary"
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  action: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "success" | "warning";
}) {
  const variantClasses = {
    primary: "border-blue-200 hover:border-blue-300 text-blue-700",
    secondary: "border-gray-200 hover:border-gray-300 text-gray-700",
    success: "border-green-200 hover:border-green-300 text-green-700",
    warning: "border-orange-200 hover:border-orange-300 text-orange-700"
  };

  return (
    <motion.div
      whileTap={!disabled ? { scale: 0.98 } : {}}
      onClick={!disabled ? action : undefined}
      className={`
        mobile-card border-2 transition-all duration-200
        ${disabled 
          ? 'opacity-50 cursor-not-allowed' 
          : `cursor-pointer hover:shadow-md ${variantClasses[variant]}`
        }
      `}
    >
      <div className="flex items-center gap-4">
        {icon && (
          <div className="flex-shrink-0">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="mobile-text-base font-semibold truncate">{title}</h3>
          {description && (
            <p className="mobile-text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>
        <ChevronRight size={20} className="flex-shrink-0 text-gray-400" />
      </div>
    </motion.div>
  );
}