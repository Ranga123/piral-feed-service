import { Pilet } from '../types';
import * as Fs from 'fs';


var piletData: Record<string, Record<string, Pilet>> = {};

export async function getPilets(): Promise<Array<Pilet>> {

  return readFile().then(() => {
    const pilets: Array<Pilet> = [];
    Object.keys(piletData).forEach(name => {
      //console.info(' GetPilates- pilte name=',piletData[name] );
      Object.keys(piletData[name]).forEach(version => {
        const pilet = piletData[name][version];
        pilets.push(pilet);
      });
    });
    return pilets;
  });
}


export async function getPilet(name: string, version: string): Promise<Pilet | undefined> {
  return readFile().then(() => {
    const versions = piletData[name] || {};
    //console.info('versions=', versions);
    return versions[version];
  });
}

function readFile() {
  return new Promise(function (resolve, reject) {
    Fs.exists('PiletDatafile.txt', function (exists) {
      if (exists) {
        Fs.readFile('PiletDatafile.txt', function (err, data) {
          if (err) {
            console.error(err);
            return reject(err);
          } else {

            //piletData = JSON.parse(data.toString().replace(/ 0+(?![\. }])/g, ' '));
            piletData = JSON.parse(data.toString());
            //console.info("Asynchronous read: " + piletData);
            resolve(piletData);
          }
        });
      } else {
        piletData = {};
        resolve(piletData);
      }
    });
  });
}


export async function setPilet(pilet: Pilet) {
  readFile().then(() => {
    //console.info('Pile=', pilet);
    const meta = pilet.meta;
    //console.info('Pile meta info=', meta);
    const current = piletData[meta.name] || {};
    //console.info('Pile current info=', current);
    //console.info('pileData Before =', piletData);
    piletData[meta.name] = {
      ...current,
      [meta.version]: pilet,
    };

    //console.info('pileData after=', piletData);

    Fs.writeFile('PiletDatafile.txt', JSON.stringify(piletData), function (err) {
      if (err) {
        return console.error(err);
      }
      //console.log("File created!");
      readFile();
    });

    //console.info('JSON string=',JSON.stringify(piletData));
  });


}
