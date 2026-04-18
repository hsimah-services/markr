#!/usr/bin/env node
import { execSync } from 'node:child_process'

execSync('npx serve dist', { stdio: 'inherit', cwd: process.cwd() })
