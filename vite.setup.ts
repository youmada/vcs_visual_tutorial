// vitest.setup.ts
import { webcrypto } from 'node:crypto'

globalThis.crypto = webcrypto as unknown as Crypto