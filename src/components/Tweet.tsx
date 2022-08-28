import { Button, Grid, TextField, Typography } from "@material-ui/core";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import SendIcon from "@material-ui/icons/Send";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { animated, useSpring } from "react-spring";

const useStyles = makeStyles({
  multilineColor: {
    color: "white",
  },
});

const greenTextFieldStyles = withStyles({
  root: {
    "& label.Mui-focused": {
      color: "#1DA1F2",
      fontSize: "1rem",
    },
    "& label": {
      color: "#1DA1F2",
    },
    "& .MuiInput-underline:after": {
      borderBottomColor: "red",
    },
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "#1DA1F2",
      },
      "&:hover fieldset": {
        borderColor: "grey",
      },
      "&.Mui-focused fieldset": {
        borderColor: "white",
      },
    },
  },
});

const GreenTextField = greenTextFieldStyles(TextField);

function Tweet() {
  const [errorMsg, setErrorMsg] = useState("");
  const [tweetText, setTweetText] = useState("");
  const [tweetLink, setTweetLink] = useState("");
  const [imageValue, setImageValue] = useState("");
  const navigate = useNavigate();
  const classes = useStyles();

  const styles = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: {
      duration: 500,
      delay: 500,
    },
  });

  const postTweet = async (e: any) => {
    e.preventDefault();
    const withImage = imageValue !== "";
    if (!tweetText.toLowerCase().includes("dupan!")) {
      setErrorMsg("Tweet wajib berisi keyword 'dupan!'");
    } else {
      const mediaId = withImage ? await postImage() : null;
      const res = await fetch("https://dualapanfess.up.railway.app/api/tweet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: tweetText, media_id: mediaId }),
      });
      if (res.ok) {
        if (errorMsg !== "") setErrorMsg("");
        const data = await res.json();
        setTweetLink(data.link);
      } else {
        setErrorMsg("Failed to upload tweet.");
      }
    }
  };

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
    const res = await fetch("https://dualapanfess.up.railway.app/api/image", {
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
        onSubmit={postTweet}
        style={{ textAlign: "center" }}
      >
        <>
          {tweetLink !== "" && window.location.replace(tweetLink)}
          <Grid container spacing={1}>
            <Grid item xs={12} alignItems="center">
              <Typography variant="h3" component="h3" className="title">
                Tweet @28FESS
              </Typography>
            </Grid>
            <Grid item xs={12} alignItems="center">
              <GreenTextField
                multiline
                rows={4}
                variant="outlined"
                style={{ width: "100%", color: "white" }}
                value={tweetText}
                onChange={(e) => setTweetText(e.target.value)}
                error={errorMsg !== ""}
                label="Tweet Text"
                helperText={errorMsg}
                InputProps={{
                  className: classes.multilineColor,
                }}
              />
            </Grid>
            {imageValue && (
              <Grid item xs={12} alignItems="center">
                <img
                  src={URL.createObjectURL(imageValue as any)}
                  alt="your"
                  style={{ maxHeight: "100px" }}
                />
              </Grid>
            )}
            <Grid item xs={12} alignItems="center">
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
            <Grid item xs={12} alignItems="center">
              <Button
                type="submit"
                variant="contained"
                color="primary"
                style={{ width: "100%" }}
              >
                <SendIcon style={{ paddingRight: "20px" }} />
                Post Tweet
              </Button>
            </Grid>
            <Grid item xs={12} alignItems="center">
              <Button
                variant="contained"
                color="secondary"
                onClick={() => navigate("/")}
              >
                Home
              </Button>
            </Grid>
          </Grid>
        </>
      </form>
    </animated.div>
  );
}

export default Tweet;
