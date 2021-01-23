module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parserOptions: {
    parser: 'babel-eslint'
  },
  extends: [
    '@nuxtjs',
    'plugin:nuxt/recommended',
    // 'plugin:vue/recommended',
  ],
  plugins: [
  ],
  // add your custom rules here
  rules: {
    camelcase: 'off',
    'comma-dangle': ['warn', 'only-multiline'],
    'vue/html-indent': ['warn', 2, {
      baseIndent: 0,
    }],
  }
}
