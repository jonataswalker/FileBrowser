export default (url, options = {}) => {
  const config = {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  };
  options = Object.assign(config, options);

  if (options.body) options.body = JSON.stringify(options.body);

  console.log('fetch', options);
  return fetch(url, options)
    .then(handleResponse, handleNetworkError);
};

function handleResponse(response) {
  return response.ok
    ? response.json()
    : response.json().then(err => { throw err });
}

function handleNetworkError(error) {
  throw { message: error.message };
}
