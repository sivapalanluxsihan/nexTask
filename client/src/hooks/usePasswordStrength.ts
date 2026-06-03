import { PASSWORD_RULES, PASSWORD_RULE_TESTS } from '@nextask/types';
import { useMemo } from 'react';

interface Rule {
  id: string;
  label: string;
  met: boolean;
}

type StrengthLevel = 'empty' | 'weak' | 'fair' | 'good' | 'strong';

interface PasswordStrength {
  rules: Rule[];
  metCount: number;
  totalCount: number;
  isValid: boolean;
  level: StrengthLevel;
  percentage: number;
  color: string;
  label: string;
}

const LEVELS: Record<number, { level: StrengthLevel; color: string; label: string }> = {
  0: { level: 'empty', color: '#3f3f46', label: '' },
  1: { level: 'weak', color: '#ef4444', label: 'Weak' },
  2: { level: 'weak', color: '#ef4444', label: 'Weak' },
  3: { level: 'fair', color: '#f59e0b', label: 'Fair' },
  4: { level: 'good', color: '#3b82f6', label: 'Good' },
  5: { level: 'strong', color: '#22c55e', label: 'Strong' },
};

export function usePasswordStrength(password: string): PasswordStrength {
  return useMemo(() => {
    const rules: Rule[] = PASSWORD_RULES.map((r) => {
      const test = PASSWORD_RULE_TESTS[r.id];
      return { id: r.id, label: r.label, met: test ? test(password) : false };
    });
    const metCount = rules.filter((r) => r.met).length;
    const { level, color, label } = LEVELS[metCount];

    return {
      rules,
      metCount,
      totalCount: PASSWORD_RULES.length,
      isValid: metCount === PASSWORD_RULES.length,
      level,
      percentage: (metCount / PASSWORD_RULES.length) * 100,
      color,
      label,
    };
  }, [password]);
}
