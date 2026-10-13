/**
 * GTS Solution Schemas - FrontX Standard Template
 *
 * Application-specific derived schemas that extend the core GTS type system.
 * These schemas constrain property values to the set of values a standard
 * FrontX application supports (registered themes, supported languages,
 * screen extension type, navigation group type).
 *
 * Owned by this package and imported from it (`@gears-frontx/frontx-template-shell`);
 * the framework does not re-export them.
 *
 * @packageDocumentation
 */

import type { JSONSchema } from '@gears-frontx/gts-plugin';
import themeSchemaJson from './schemas/theme.v1.json';
import languageSchemaJson from './schemas/language.v1.json';
import extensionScreenSchemaJson from './schemas/extension_screen.v1.json';
import navGroupSchemaJson from './schemas/nav_group.v1.json';

export const themeSchema = themeSchemaJson as JSONSchema;
export const languageSchema = languageSchemaJson as JSONSchema;
export const extensionScreenSchema = extensionScreenSchemaJson as JSONSchema;
export const navGroupSchema = navGroupSchemaJson as JSONSchema;
