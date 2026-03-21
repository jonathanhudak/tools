/* eslint-disable */
// This file is auto-generated
import { Route as RootRoute } from './routes/__root';
import { Route as IndexRoute } from './routes/index';
import { Route as TuningsIndexRoute } from './routes/tunings/index';
import { Route as TuningsInstrumentRoute } from './routes/tunings/$instrumentId';
import { Route as TuningsSectionRoute } from './routes/tunings/$instrumentId.$sectionId';

export const routeTree = RootRoute.addChildren([
  IndexRoute,
  TuningsIndexRoute,
  TuningsInstrumentRoute,
  TuningsSectionRoute,
]);
