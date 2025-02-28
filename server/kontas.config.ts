import type { Kontas } from 'kontas-types'

// jangan ubah apapun pada Kontas.Config

export const config: Kontas.Config = {
    framework: 'next',
    database: 'mongodb',
    environment: 'development',
    projectDir: 'src'
}

export default config
