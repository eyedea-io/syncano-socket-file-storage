import Syncano from 'syncano-server'

export default (ctx) => {
  const {response, data, socket} = Syncano(ctx)

  data[ctx.args.className].create({...ctx.args.data, file: null})
    .then(resp => (
      socket.get('file-storage/get-upload-api-key')
      .then(key => {
        if (key) {
          response.json({
            method: 'PATCH',
            url: `https://${ctx.meta.api_host}${resp.links.self}?api_key=${key.api_key}`
          })
        } else {
          response.json({message: 'Upload failed.'}, 400)
        }
      })
    ))
    .catch(err => {
      response.json(err.response, 400)
    })
}
