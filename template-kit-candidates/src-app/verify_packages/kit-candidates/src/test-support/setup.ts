// Unmounts what a test rendered, so the next test's queries and its axe run see only its own markup.
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(cleanup);
