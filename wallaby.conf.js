module.exports = () => {
	return {
		files: [
			'./interpreter.ts',
		],
		tests: [
			'./interpreter.spec.ts',
		],
		debug: true,
		
    env: {
      type: 'node',
      runner: 'node'
    },

    testFramework: 'jest'
	};
};