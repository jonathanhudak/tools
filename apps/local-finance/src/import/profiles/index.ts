// Export all bank profiles

import type { BankProfile } from '../../core/types.js';
import { bofaProfile, bofaCreditProfile } from './bofa.js';
import { chaseProfile, chaseCheckingProfile } from './chase.js';
import { schwabCheckingProfile, schwabBrokerageProfile } from './schwab.js';
import { fidelityCashProfile, fidelityBrokerageProfile, fidelityCreditProfile } from './fidelity.js';

export const ALL_PROFILES: BankProfile[] = [
  bofaProfile,
  bofaCreditProfile,
  chaseProfile,
  chaseCheckingProfile,
  schwabCheckingProfile,
  schwabBrokerageProfile,
  fidelityCashProfile,
  fidelityBrokerageProfile,
  fidelityCreditProfile,
];

export function getProfileById(id: string): BankProfile | undefined {
  return ALL_PROFILES.find((p) => p.id === id);
}

export function getProfilesByInstitution(institution: string): BankProfile[] {
  const normalized = institution.toLowerCase();
  return ALL_PROFILES.filter((p) => p.id.startsWith(normalized) || p.name.toLowerCase().includes(normalized));
}

export {
  bofaProfile,
  bofaCreditProfile,
  chaseProfile,
  chaseCheckingProfile,
  schwabCheckingProfile,
  schwabBrokerageProfile,
  fidelityCashProfile,
  fidelityBrokerageProfile,
  fidelityCreditProfile,
};
