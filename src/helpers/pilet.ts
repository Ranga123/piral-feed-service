import { dirname, basename } from 'path';
import { formatAuthor } from './author';
import { untar } from './untar';
import { computeHash } from './hash';
import { PiletMetadata, PackageData, PackageFiles, Pilet } from '../types';

const packageRoot = 'package/';
let iter = 1;

function getPackageJson(files: PackageFiles): PackageData {
  const fileName = `${packageRoot}package.json`;
  const fileContent = files[fileName];
  const content = fileContent.toString('utf8');
  return JSON.parse(content);
}

function getContent(path: string, files: PackageFiles) {
  const content = path && files[path];
  return content && content.toString('utf8');
}

function getPiletMainPath(data: PackageData, files: PackageFiles) {
  const paths = [
    data.main,
    `dist/${data.main}`,
    `${data.main}/index.js`,
    `dist/${data.main}/index.js`,
    'index.js',
    'dist/index.js',
  ];
  return paths.map(filePath => `${packageRoot}${filePath}`).filter(filePath => !!files[filePath])[0];
}

export function extractPiletMetadata(
  data: PackageData,
  main: string,
  file: string,
  files: PackageFiles,
  rootUrl: string,
): PiletMetadata {
  const name = data.name;
  const version = data.preview ? `${data.version}-pre.${iter++}` : data.version;
  return {
    name,
    description: data.description,
    version,
    custom: data.custom,
    author: formatAuthor(data.author),
    hash: computeHash(main),
    link: `${rootUrl}/files/${name}/${version}/${file}`,
    license: {
      type: data.license || 'ISC',
      text: getContent(`${packageRoot}LICENSE`, files) || '',
    },
  };
}

export function getPiletDefinition(stream: NodeJS.ReadableStream, rootUrl: string): Promise<Pilet> {
  return untar(stream).then(files => {
    const data = getPackageJson(files);
    const path = getPiletMainPath(data, files);
    const root = dirname(path);
    const file = basename(path);
    const main = getContent(path, files);
    const meta = extractPiletMetadata(data, main, file, files, rootUrl);
    return {
      meta,
      root,
      files,
    };
  });
}
