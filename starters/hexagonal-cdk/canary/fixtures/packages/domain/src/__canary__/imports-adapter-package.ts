// CANARY: domain importing an adapter package it does not (and must not) declare.
import { InMemoryComponentRepo } from '@hex/adapters-driven';

export const leaked = InMemoryComponentRepo;
