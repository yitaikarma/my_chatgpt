module.exports = {
  /*
   * Resolve and load @commitlint/config-conventional from node_modules.
   * Referenced packages must be installed
   */
  extends: ['@commitlint/config-conventional'],
  /*
   * Resolve and load conventional-changelog-atom from node_modules.
   * Referenced packages must be installed
   */
  // parserPreset: 'conventional-changelog-atom',

  /*
   * Resolve and load @commitlint/format from node_modules.
   * Referenced package must be installed
   */
  // formatter: '@commitlint/format',

  // Any rules defined here will override rules from @commitlint/config-conventional
  rules: {
    // type 类型定义，表示 git 提交的 type 必须在以下类型范围内
    'type-enum': [
      2,
      'always',
      [
        'feat', // 新功能 feature
        'fix', // 修复 bug
        'style', // 代码格式(不影响代码运行的变动)
        'docs', // 文档注释
        'refactor', // 重构(既不增加新功能，也不是修复bug)
        'perf', // 性能优化
        'test', // 增加测试
        'chore', // 构建过程或辅助工具的变动
        'ci', // ci 配置文件修改
        'revert', // 回退
        'build' // 打包
      ]
    ],
    // subject 大小写不做校验
    'subject-case': [0]
  },

  // Functions that return true if commitlint should ignore the given message.
  ignores: [(commit) => commit === ''],

  // Whether commitlint uses the default ignore rules.
  defaultIgnores: true,

  //  Custom URL to show upon failure
  helpUrl: 'https://github.com/conventional-changelog/commitlint/#what-is-commitlint',

  // Custom prompt configs
  prompt: {
    messages: {},
    questions: {
      type: {
        description: 'please input type:'
      }
    }
  }
}
