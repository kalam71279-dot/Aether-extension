const text = "<think>some text here without end tag"; console.log(text.replace(/<think>[\s\S]*?(?:<\/think>|$)/gi, "replaced"));
