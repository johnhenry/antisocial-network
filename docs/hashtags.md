# Hashtags

Hashtags change the default way posts are processed.

## #advanced-prompting or #ap

This hashtag enables advanced prompting strategies for the post.

### Parameters

#### strategy=<string>

Dictates the strategy used. There is currently one strategy available:

##### mixture-of-agents

The mixture-of-agents strategy combines responses from multiple different agents into a single, high-quality response.

Read more about this strategy [here](https://arxiv.org/abs/2406.04692).

Example:

```
@president-pat, @judge-judy, @congressperson-carl

What are the three branches of government? #ap
```

This will elicit responses from each of the three mentioned agents and attach a fourth response that is a combination of the previous three.

##### rounds=<integer>

```
@president-pat, @judge-judy, @congressperson-carl

What's the best plan for the future of the planet?

#ap&rounds=3
```

1. This will elicit responses from the three mentioned agents and then generate a combined response from all of the responses.
2. The agents will then respond to the combined response.
3. This process will go through three rounds of responses.

## #tools or #tl

This hashtag enables tools to process the post.

> [!WARNING]
> This feature is not fully functional yet and may result in invisible errors.
>
> Be prepared for the possibility of receiving no response.

### Parameters

#### name=<string> -- the name of the tool to be used

Example:

```markdown
What time is it at UTC+0?

#tl&name=time
```

### Available Tools

- time -- gets the current time based on the UTC timezone
- weather -- gets the current weather based on longitude and latitude
- javascript -- runs JavaScript
- subtraction -- subtracts two numbers (used primarily as a guide for creating new tools)
