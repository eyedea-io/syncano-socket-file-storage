import axios from 'axios'
import Syncano from 'syncano-server'

export default (ctx) => {
  const {response} = Syncano(ctx)

  const rootUrl = `https://api.syncano.io/v2/instances/${ctx.meta.instance}`
  const classRoot = `${rootUrl}/classes/${ctx.meta.className}`

  createApiKeyIfNotExists()
    .then(() => (
      axios.put(`${classRoot}/objects/acl/?api_key=${ctx.meta.token}`, {
        acl: {'*': ['update']}
      })
    ))
    .then(() => createFileFieldIfNotExists())
    .then(() => {
      response.json({message: 'Setup completed'})
    })
    .catch(err => {
      response.json({message: err.response.data}, 400)
    })

  function createFileFieldIfNotExists () {
    return getClassData().then(data => {
      const schema = data.schema
      const isFileField = schema.find(field => field.name === 'file' && field.type === 'file')

      if (!isFileField) {
        schema.push({
          name: 'file',
          type: 'file'
        })
        return axios.patch(`${classRoot}/?api_key=${ctx.meta.token}`, {
          schema
        })
      }
    })
  }

  function createApiKeyIfNotExists () {
    return getApiKey().then(apiKey => {
      if (!apiKey) {
        createApiKey()
      }
    })
  }

  function getApiKey () {
    return axios.get(`${rootUrl}/api_keys/?api_key=${ctx.meta.token}`)
      .then(res => res.data.objects.find(key => key.description === 'Api key for upload files'))
  }

  function createApiKey () {
    return axios.post(`${rootUrl}/api_keys/?api_key=${ctx.meta.token}`, {
      description: 'Api key for upload files',
      ignore_acl: true
    })
    .then(res => res.data)
  }

  function getClassData () {
    return axios.get(`${classRoot}/?api_key=${ctx.meta.token}`)
    .then(res => res.data)
  }
}
