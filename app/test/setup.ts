import '@testing-library/jest-dom/vitest';
import { i18n } from '../lib/i18n';
// Force Japanese in tests so assertions on hardcoded Japanese text pass
i18n.changeLanguage('ja');
