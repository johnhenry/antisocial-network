// export const recordMatch = /[\@\#](?:agent|meme|file):[\w]+/;
export const recordMatch = /^[\@\#](?:agent|meme|file):[\w]+(?!:)$/;

export const mentionMatch = /(?:^|\s)[@#]\w[\w:-]*\w/;
