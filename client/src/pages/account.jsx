import React, { useEffect, useRef, useState } from "react";
import { Input } from "../components";
import { AvatarSvg, LogoutSvg } from "../assets";
import { setLoading } from "../redux/additional";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import axios from "../lib/axios";

const Account = () => {
  const dispatch = useDispatch();

  const location = useLocation();

  const ref = useRef({});

  const user = useSelector((state) => state?.user);

  const [state, setState] = useState({
    otp: undefined,
    form: {
      ...user,
      img: user?.img && `/files/profiles/${user?._id}/${user?.img}`,
    },
    size_sm: window.matchMedia("(max-width:680px)")?.matches,
    uploading: {
      status: false,
      percent: 0,
    },
  });

  const InputHandle = (e) => {
    e?.preventDefault?.();

    if (e?.target?.name === "avatar") {
      setState((state) => ({
        ...state,
        form: {
          ...state?.form,
          img: URL.createObjectURL(e?.target?.files?.[0]),
          avatar: e?.target?.files?.[0],
        },
      }));

      if (ref?.current?.div) {
        ref.current.div.style.display = "none";
      }
    } else {
      if (e?.target?.name === "email") {
        setState((state) => ({
          ...state,
          form: {
            ...state.form,
            OTP: "",
          },
          otp: undefined,
        }));
      }

      setState((state) => ({
        ...state,
        form: {
          ...state?.form,
          [e?.target?.name]: e?.target?.value,
        },
      }));
    }
  };

  const onUploadProgress = (e) => {
    const { loaded, total } = e;

    let percent = Math.floor((loaded * 100) / total);

    if (percent < 100) {
      setState((state) => ({
        ...state,
        uploading: {
          status: true,
          percent,
        },
      }));
    } else {
      setState((state) => ({
        ...state,
        uploading: {
          status: false,
          percent: 0,
        },
      }));
    }
  };

  const FormHandle = async (e, resend) => {
    e?.preventDefault?.();

    const formData = new FormData();

    Object?.keys(state?.form)?.map((key) => {
      if (key !== "_id" && key !== "img") {
        formData.append(key, state?.form?.[key]);
      }
    });

    try {
      if (resend) {
        let res = await axios.post(`/user/edit-profile-otp`, state?.form);

        if (res?.["data"]?.data?.otp) {
          setState((state) => ({
            ...state,
            otp: true,
          }));
        }
      } else if (state?.otp) {
        let res = await axios.put(
          `/user/edit-profile-verify?OTP=${state?.form?.OTP}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            onUploadProgress,
          }
        );

        if (res?.["data"]) {
          setState((state) => ({
            ...state,
            otp: undefined,
            form: {
              ...state.form,
              OTP: "",
              avatar: null,
            },
          }));
        }
      } else {
        let res = await axios.post(`/user/edit-profile-otp`, state?.form);

        if (res?.["data"]?.data?.otp) {
          setState((state) => ({
            ...state,
            otp: true,
          }));
        }
      }
    } catch (err) {
      alert(
        typeof err?.response?.data?.message === "string"
          ? err?.response?.data?.message
          : "Something Went Wrong"
      );
    }
  };

  useEffect(() => {
    document.title = "Soft Chat - Account";

    if (user) {
      setTimeout(() => {
        dispatch(setLoading(false));
      }, 1000);
    } else {
      dispatch(setLoading(true));
    }

    const onResize = () => {
      setState((state) => ({
        ...state,
        size_sm: window.matchMedia("(max-width:680px)")?.matches,
      }));
    };

    const onClick = (e) => {
      if (
        !ref?.current?.div?.contains(e?.target) &&
        !ref?.current?.img?.contains(e?.target)
      ) {
        if (ref?.current?.div) {
          ref.current.div.style.display = "none";
        }
      }
    };

    window.addEventListener("resize", onResize);

    window.addEventListener("click", onClick);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("click", onClick);
    };
  }, [user, location]);

  return (
    <section className="account">
      <div className="content">
        <button className="logout">
          <LogoutSvg width={"20px"} height={"20px"} />
        </button>

        <form onSubmit={FormHandle}>
          <div className="cover">
            {state?.form?.img ? (
              <>
                <img
                  src={state?.form?.img}
                  alt="profile"
                  ref={(elm) => {
                    if (ref?.current) {
                      ref.current.img = elm;
                    }
                  }}
                  onClick={() => {
                    if (ref?.current?.div) {
                      ref.current.div.style.display = "block";
                    }
                  }}
                />

                {!state?.uploading?.status && (
                  <div
                    className="actions_cover"
                    ref={(elm) => {
                      if (ref?.current) {
                        ref.current.div = elm;
                      }
                    }}
                  >
                    <div className="list">
                      <button
                        type="button"
                        onClick={() => {
                          window?.open?.(state?.form?.img, "_blank");
                        }}
                      >
                        Show Image
                      </button>
                      <button type="button" data-for="input">
                        <Input
                          name="avatar"
                          type="file"
                          accept="image/*"
                          onChange={InputHandle}
                        />
                        Edit Image
                      </button>
                    </div>
                  </div>
                )}

                <div
                  className={`uploading ${
                    state?.uploading?.status ? "active" : ""
                  }`}
                  style={{
                    background: `linear-gradient(to right, #6b8afd ${state?.uploading?.percent}%, #fff 0%)`,
                  }}
                />
              </>
            ) : (
              <>
                <AvatarSvg height={"4.5rem"} width={"4.5rem"} />

                <div
                  className={`uploading ${
                    state?.uploading?.status ? "active" : ""
                  }`}
                  style={{
                    background: `linear-gradient(to right, #6b8afd ${state?.uploading?.percent}%, #fff 0%)`,
                  }}
                />

                <Input
                  name="avatar"
                  type="file"
                  accept="image/*"
                  onChange={InputHandle}
                />
              </>
            )}
          </div>
          <Input
            name={"name"}
            placeholder={"Enter Name"}
            label={"Full Name"}
            type="text"
            value={state?.form?.name || ""}
            onChange={InputHandle}
            required
          />

          <Input
            name={"about"}
            placeholder={"Enter About"}
            label={"About"}
            type="text"
            value={state?.form?.about || ""}
            onChange={InputHandle}
            isTextArea
            required
          />

          <Input
            name={"email"}
            placeholder={"Enter Email"}
            label={"Email"}
            type="email"
            value={state?.form?.email || ""}
            onChange={InputHandle}
            required
          />

          <Input
            name={"number"}
            placeholder={"Enter Number"}
            label={"Number"}
            type="number"
            value={state?.form?.number || ""}
            onChange={InputHandle}
            required
          />

          {state?.otp && (
            <div className="otp">
              <Input
                name={"OTP"}
                placeholder={"Enter OTP"}
                label={"OTP*"}
                value={state?.form?.OTP || ""}
                onChange={InputHandle}
              />
              <button
                type="button"
                onClick={() => {
                  FormHandle(undefined, true);
                }}
                className="resend"
              >
                Resend
              </button>
            </div>
          )}

          {state?.otp ? (
            state?.uploading?.status ? (
              <button data-for="submit" type="button">
                Updating
              </button>
            ) : (
              <button data-for="submit" type="submit">
                Submit
              </button>
            )
          ) : (
            <button data-for="submit" type="submit">
              Sent Otp
            </button>
          )}
        </form>
      </div>

      {!state?.size_sm && (
        <div className="mesg_empty">
          <h1>Select a chat to start messaging</h1>
        </div>
      )}
    </section>
  );
};

export default Account;
