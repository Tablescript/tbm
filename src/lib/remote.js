import axios from 'axios';

const pipeToWriter = (writer) => (response) => {
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
};

export const getAndStreamInto = (url, writer) => axios.get(url, { responseType: 'stream' }) // eslint-disable-line import/prefer-default-export
  .then(pipeToWriter(writer));
