import React from 'react';
import { Link } from 'react-router-dom';

export interface PageBreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

export interface PageBreadcrumbProps {
  ariaLabel: string;
  items: PageBreadcrumbItem[];
  className?: string;
}

export default function PageBreadcrumb({ ariaLabel, items, className }: PageBreadcrumbProps) {
  if (items.length === 0) {
    return null;
  }
  return (
    <nav className={['page-breadcrumb', className].filter(Boolean).join(' ')} aria-label={ariaLabel}>
      <ol className="page-breadcrumb__list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isCurrent = item.current ?? isLast;
          return (
            <React.Fragment key={`${item.label}-${index}`}>
              <li className="page-breadcrumb__item" aria-current={isCurrent ? 'page' : undefined}>
                {item.href && !isCurrent ? (
                  <Link to={item.href}>{item.label}</Link>
                ) : (
                  <span>{item.label}</span>
                )}
              </li>
              {index < items.length - 1 ? (
                <li className="page-breadcrumb__sep" aria-hidden="true">›</li>
              ) : null}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}