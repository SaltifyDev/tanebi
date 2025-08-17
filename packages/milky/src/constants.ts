import packageJson from '../package.json';
import corePackageJson from 'tanebi/package.json';

export const appName = packageJson.name;
export const appVersion = packageJson.version;
export const coreVersion = corePackageJson.version;