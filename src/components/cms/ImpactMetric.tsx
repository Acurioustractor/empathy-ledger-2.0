import React from 'react';
import { createClient } from '@supabase/supabase-js';

interface ImpactMetricProps {
  dataSource: 'storytellers' | 'stories' | 'organizations' | 'locations';
  metricType?: 'count' | 'sum' | 'average';
  label: string;
  suffix?: string;
  colorTheme?: 'primary' | 'secondary' | 'accent';
}

export default function ImpactMetric({
  dataSource,
  metricType = 'count',
  label,
  suffix = '',
  colorTheme = 'primary'
}: ImpactMetricProps) {
  const [value, setValue] = React.useState<number>(0);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchMetric() {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      let query = supabase.from(dataSource).select('*');
      
      // Add privacy filters
      if (dataSource === 'storytellers') {
        query = query.eq('consent_given', true);
      } else if (dataSource === 'stories') {
        query = query.eq('privacy_level', 'public');
      }

      const { data, error } = await query;

      if (!error && data) {
        setValue(data.length);
      }
      setLoading(false);
    }

    fetchMetric();
  }, [dataSource, metricType]);

  const themeClasses = `impact-metric ${colorTheme}`;

  return (
    <div className={themeClasses}>
      <div className="metric-value">
        {loading ? '...' : value.toLocaleString()}
        {suffix && <span className="suffix">{suffix}</span>}
      </div>
      <div className="metric-label">{label}</div>

      <style jsx>{`
        .impact-metric {
          text-align: center;
          padding: 2rem 1rem;
          background: var(--card-background, #ffffff);
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s ease;
        }
        
        .impact-metric:hover {
          transform: translateY(-2px);
        }
        
        .impact-metric.primary {
          border-top: 4px solid var(--primary-color, #B85C38);
        }
        
        .impact-metric.secondary {
          border-top: 4px solid var(--secondary-color, #1A3A52);
        }
        
        .impact-metric.accent {
          border-top: 4px solid var(--accent-color, #7A9B76);
        }
        
        .metric-value {
          font-size: 3rem;
          font-weight: 800;
          color: var(--primary-color, #B85C38);
          line-height: 1;
          margin-bottom: 0.5rem;
        }
        
        .suffix {
          font-size: 1.5rem;
          margin-left: 0.25rem;
        }
        
        .metric-label {
          font-size: 1.1rem;
          color: var(--text-color, #2D2D2D);
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}