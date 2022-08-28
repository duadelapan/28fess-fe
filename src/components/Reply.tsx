import {
  Button,
  Grid,
  LinearProgress,
  TextField,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import SendIcon from "@material-ui/icons/Send";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { animated, useSpring } from "react-spring";

const useStyles = makeStyles({
  cssLabel: {
    color: "white",
  },
  root: {
    borderColor: "white",
    color: "white",
  },
});
const Reply = () => {
  const [tweetHTML, setTweetHTML] = useState("");
  const [tweetLink, setTweetLink] = useState("");
  const [tweetText, setTweetText] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [replyToken, setReplyToken] = useState("");
  const [isRequested, setIsRequested] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imageValue, setImageValue] = useState("");
  const classes = useStyles();
  const navigate = useNavigate();

  const styles = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: {
      duration: 500,
      delay: 500,
    },
  });
  const getHTML = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    const res = await fetch(
      `https://dualapan.herokuapp.com/api/get-tweet-html?link=${tweetLink}`
    );
    const data = await res.json();
    if (res.ok) {
      let html = data.html;
      if (!html.includes("<script")) {
        html +=
          '<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>';
      }
      setReplyToken(data.reply_token);
      console.log(data.reply_token);
      setTweetHTML(data.html);
      setErrorMsg("");
    } else {
      setErrorMsg(data.error ? data.error : "Link");
    }
    setIsLoading(false);
  };

  const clearTweetEmbed = () => {
    document.getElementsByClassName("tweets")[0].innerHTML = "";
    setTweetHTML("");
    setTweetLink("");
  };

  useEffect(() => {
    const anchor = document.createElement("a");
    anchor.setAttribute("class", "twitter-timeline");
    anchor.setAttribute("data-theme", "dark");
    anchor.setAttribute("data-tweet-limit", "5");
    anchor.setAttribute("data-chrome", "noheader nofooter noborders");
    anchor.setAttribute("href", tweetLink);
    const twitterEmbed = document.getElementsByClassName("twitter-embed");
    if (twitterEmbed[0]) {
      if (tweetHTML === "") {
        twitterEmbed[0].innerHTML = "";
      }
      twitterEmbed[0].appendChild(anchor);
      const script = document.createElement("script");
      script.setAttribute("src", "https://platform.twitter.com/widgets.js");
      document.getElementsByClassName("twitter-embed")[0].appendChild(script);
    }
  });

  const postTweet = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    const withImage = imageValue !== "";
    if (isRequested) {
      setErrorMsg("Uploading tweet, please wait.");
      return;
    }
    if (tweetText.length < 5) {
      setErrorMsg("Tweet terlalu pendek");
    } else {
      setIsRequested(true);
      const mediaId = withImage ? await postImage() : null;
      const res = await fetch("https://dualapan.herokuapp.com/api/tweet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: tweetText,
          reply: true,
          reply_link: tweetLink,
          reply_token: replyToken,
          media_id: mediaId,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        if (errorMsg !== "") setErrorMsg("");
        window.location.replace(data.link);
      } else {
        setIsRequested(false);
        setErrorMsg(data.error ? data.error : "Failed to upload tweet.");
      }
    }
    setIsLoading(false);
  };
  // {tweetHTML !== "" ? getHTML : postTweet}

  const handleFileChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        setImageValue(file);
      }
    }
  };

  const postImage = async () => {
    let formData = new FormData();
    formData.append("files", imageValue);
    const res = await fetch("https://dualapan.herokuapp.com/api/image", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    return data.media_id;
  };

  return (
    <animated.div className="inner" style={styles}>
      <form
        noValidate
        autoComplete="off"
        onSubmit={tweetHTML === "" ? getHTML : postTweet}
      >
        <Grid container spacing={1} style={{ textAlign: "center" }}>
          {tweetHTML !== "" ? (
            <>
              <Grid
                item
                xs={12}
                alignContent="center"
                className="twitter-embed"
              >
                <div
                  className="tweets"
                  dangerouslySetInnerHTML={{ __html: tweetHTML }}
                ></div>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Reply Tweet"
                  variant="outlined"
                  error={errorMsg !== ""}
                  helperText={errorMsg}
                  value={tweetText}
                  onChange={(e) => setTweetText(e.target.value)}
                  multiline
                  rows={3}
                  style={{ width: "100%" }}
                  InputLabelProps={{
                    classes: {
                      root: classes.cssLabel,
                    },
                  }}
                  InputProps={{
                    classes: {
                      root: classes.root,
                      notchedOutline: classes.root,
                    },
                  }}
                />
              </Grid>
              {imageValue && (
                <Grid item xs={12} alignContent="center">
                  <img
                    src={URL.createObjectURL(imageValue as any)}
                    alt="your"
                    style={{ maxHeight: "100px" }}
                  />
                </Grid>
              )}
              <Grid item xs={12} alignContent="center">
                <input
                  accept="image/*"
                  hidden
                  id="raised-button-file"
                  type="file"
                  onChange={handleFileChange}
                />
                <label htmlFor="raised-button-file">
                  <Button variant="contained" component="span">
                    {imageValue
                      ? (imageValue as any).name
                      : "Upload an image (optional)"}
                  </Button>
                </label>
              </Grid>
              {isLoading && (
                <Grid item xs={12} alignContent="center">
                  <LinearProgress />
                </Grid>
              )}
              <Grid item xs={12} alignContent="center">
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  style={{ width: "100%" }}
                >
                  <SendIcon style={{ paddingRight: "20px" }} />
                  Send Reply
                </Button>
              </Grid>
              <Grid item xs={12} alignContent="center">
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={clearTweetEmbed}
                >
                  Back
                </Button>
              </Grid>
            </>
          ) : (
            <>
              <Grid item xs={12} alignContent="center">
                <Typography variant="h3" component="h3" className="title">
                  Reply @28FESS
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Tweet Link To Reply"
                  value={tweetLink}
                  error={errorMsg !== ""}
                  helperText={errorMsg}
                  onChange={(e) => setTweetLink(e.target.value)}
                  variant="outlined"
                  style={{ width: "100%" }}
                  InputLabelProps={{
                    classes: {
                      root: classes.cssLabel,
                    },
                  }}
                  InputProps={{
                    classes: {
                      root: classes.root,
                      notchedOutline: classes.root,
                    },
                  }}
                />
              </Grid>
              {isLoading && (
                <Grid item xs={12} alignContent="center">
                  <LinearProgress />
                </Grid>
              )}
              <Grid item xs={12} alignContent="center">
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  style={{ width: "100%" }}
                >
                  Check Link
                </Button>
              </Grid>
            </>
          )}
          <Grid item xs={12} alignContent="center">
            <Button
              variant="contained"
              color="secondary"
              onClick={() => navigate("/")}
            >
              Home
            </Button>
          </Grid>
        </Grid>
      </form>
    </animated.div>
  );
};

export default Reply;
