// Configuracao ESLint v9+ (flat config) para o projeto Infinity Squad
// Usa apenas regras nativas do ESLint — sem dependencias adicionais

module.exports = [
  {
    // Arquivos JavaScript do projeto
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: {
        // Globais do Node.js (servidor)
        require: "readonly",
        module: "readonly",
        exports: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        process: "readonly",
        console: "readonly",
        Buffer: "readonly",
        setTimeout: "readonly",
        setInterval: "readonly",
        clearTimeout: "readonly",
        clearInterval: "readonly",
        // Globais do navegador (dashboard client-side)
        document: "readonly",
        window: "readonly",
        localStorage: "readonly",
        fetch: "readonly",
        io: "readonly",
        AudioContext: "readonly",
        webkitAudioContext: "readonly",
      },
    },
    rules: {
      // Permitir console.log — essencial para logs do servidor
      "no-console": "off",
      // Avisar sobre variaveis nao utilizadas, ignorando as prefixadas com _
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      // Proibir uso de eval (seguranca)
      "no-eval": "error",
      // Proibir uso de variaveis nao declaradas
      "no-undef": "error",
      // Exigir uso de === em vez de ==
      eqeqeq: "warn",
    },
  },
  {
    // Diretorios ignorados pelo linter
    ignores: [
      "node_modules/**",
      "_bmad-output/dashboard/node_modules/**",
      ".agent/**",
      "_bmad/**",
    ],
  },
];
