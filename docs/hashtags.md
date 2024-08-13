# Hashtags

Hastags change the default way posts are processed.

## #advanced-prompting or #ap

This hashtag enables advanced prompting strategies for the post.

### Parameters

### strategy=<string>

Dictates the strategy used. There is currently only one strategy available:

#### mixture-of-agents

The mixtue of agents strategy combines responses from multiple different agents and generates a combined response.

```
@president-pat, @judge-judy, @congressperson-carl

What are the three branches of governemt #ap
```

This will elicit responses from the three mentioned agents and then generate a combined response from all of the responses.

##### levels=<integer>

```
@president-pat, @judge-judy, @congressperson-carl

What's the best plan for the futher of the planet.

#ap&levels=3
```

This will elicit responses from the three mentioned agents and then generate a combined response from all of the responses. The agents will then respond to the combined response. This will go through three rounds of responses.
