import fs from 'fs';
import { outputDir } from './output-dir.js';

export function capitalizeString(str) {
  return str.replace(/(?:^|-)([a-z])/g, (m, char) => char.toUpperCase());
}

/**
 * Parse build modules from env `SWIPER_BUILD_MODULES`.<br>
 * Will return null if env is not set or empty
 * @returns {string[]|null}
 */
export function parseSwiperBuildModulesEnv() {
  if (process.env.SWIPER_BUILD_MODULES) {
    const buildModules = process.env.SWIPER_BUILD_MODULES.split(/[,\s]+/).filter(
      (moduleName) => moduleName, // ensure to empty will be removed
    );
    if (buildModules.length) return buildModules;
  }
  return null;
}

function addPathPrefix(obj, need, prefix) {
  const regex = /^\.+\//;

  if (typeof obj === 'string') {
    return regex.test(obj) ? obj.replace(/^\.+\//, prefix) : prefix + obj;
  }

  if (typeof obj === 'object') {
    need.forEach((key) => {
      if (obj[key]) {
        const nextOjb = obj[key];
        obj[key] = addPathPrefix(
          nextOjb,
          typeof nextOjb === 'object' ? Object.keys(nextOjb) : [],
          prefix,
        );
      }
    });
  }

  return obj;
}

export function exportProd() {
  const pkgPath = new URL('../../package.json', import.meta.url);
  const pkg = JSON.parse(fs.readFileSync(pkgPath));
  const childPkg = JSON.parse(
    fs.readFileSync(new URL(`../../${outputDir}/package.json`, import.meta.url)),
  );

  const need = ['typings', 'main', 'module', 'exports', 'typesVersions'];

  const configs = addPathPrefix(childPkg, need, `./${outputDir}/`);
  need.forEach((key) => {
    pkg[key] = configs[key];
  });

  fs.writeFileSync(pkgPath, JSON.stringify(pkg));
}
