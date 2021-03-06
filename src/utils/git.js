import parseGitConfig from 'parse-git-config'
import gitConfigPath from 'git-config-path'

/**
 * Get git user
 * @returns {name, email}
 */
export function getGitUser() {
  return Object.assign(
    { name: '', email: '' },
    parseGitConfig.sync({ cwd: '/', path: gitConfigPath('global') }).user
  )
}
