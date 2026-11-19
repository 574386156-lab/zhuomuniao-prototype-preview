
      (function () {
        "use strict";

        var ROUTES = {
          "home": { label: "我的首页", parent: "我的首页" },
          "patient-archives": { label: "患者档案", parent: "患者管理" },
          "patient-archive-detail": { label: "患者档案详情", parent: "患者管理" },
          "tag-management": { label: "标签管理", parent: "患者管理" },
          "aggregate-chat": { label: "聚合聊天", parent: "会话管理" },
          "my-todos": { label: "我的待办", parent: "会话管理" },
          "member-assignment": { label: "成员分配与接待管理", parent: "会话管理" },
          "materials": { label: "素材管理", parent: "运营管理" },
          "material-create": { label: "新建素材", parent: "运营管理" },
          "material-detail": { label: "素材详情", parent: "运营管理" },
          "message-tasks": { label: "消息触达", parent: "运营管理" },
          "message-task-create": { label: "新建消息任务", parent: "运营管理" },
          "followup-rules": { label: "随访规则", parent: "运营管理" },
          "care-entry": { label: "合规服务入口", parent: "运营管理" },
          "ops-patients": { label: "患者列表", parent: "运营管理" }
        };
        var MENU = [
          { label: "我的首页", icon: "fa-house", route: "home" },
          { label: "项目管理", icon: "fa-folder", children: [{ label: "项目信息", route: "projects" }] },
          { label: "用户管理", icon: "fa-user", children: [{ label: "医助账号管理", route: "accounts" }, { label: "医生用户管理", route: "doctors" }] },
          { label: "注册管理", icon: "fa-user-plus", children: [{ label: "患者注册场景码配置", route: "patient-scenes" }] },
          { label: "患者管理", icon: "fa-hospital-user", children: [{ label: "患者档案", route: "patient-archives" }, { label: "标签管理", route: "tag-management" }] },
          { label: "会话管理", icon: "fa-comment-dots", children: [{ label: "聚合聊天", route: "aggregate-chat", openInNewWindow: true }, { label: "成员分配与接待管理", route: "member-assignment" }] },
          { label: "运营管理", icon: "fa-chart-column", children: [{ label: "素材管理", route: "materials" }, { label: "消息触达", route: "message-tasks" }, { label: "随访规则", route: "followup-rules" }, { label: "患者列表", route: "ops-patients" }] },
          { label: "Bot 管理", icon: "fa-robot", children: [{ label: "Bot 配置", route: "bot-config" }, { label: "智能体管理", route: "agent-admin", external: true }, { label: "智能体工作台（先不做）", route: "agent-management" }] }
        ];
        var TYPE_ICONS = {
          "文本": "fa-align-left",
          "图片": "fa-image",
          "网页": "fa-window-maximize",
          "视频": "fa-circle-play",
          "语音": "fa-microphone",
          "文件": "fa-file",
          "小程序": "fa-link"
        };
        var INFO_IMAGE = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAASABIAAD/4QBMRXhpZgAATU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAA3KADAAQAAAABAAAAxAAAAAD/wAARCADEANwDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9sAQwAEBAQEBAQIBAQICwgICAsPCwsLCw8SDw8PDw8SFhISEhISEhYWFhYWFhYWGxsbGxsbHx8fHx8jIyMjIyMjIyMj/9sAQwEFBgYJCAkPCAgPJBkUGSQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQk/90ABAAO/9oADAMBAAIRAxEAPwD7o/sTRzLBP9lh32rM0J2L+7Z/vFeOCe+OtTzaZp1xDPbzwRulyMTKVGHBGPm9eOOe1SfaYexNH2qP3/KtPeJujPudA0e6uLa7ubWGSWzybd3QFosjHyEjjj0q5DY2lvcS3UUarJOVMrgYLlRhdx74HAqX7VF3z+VL9oiPrR73ULoq2ek6Vp9xNdWNtFDLcNuldECl29WIGSfrWa/g7wpJD5D6balM5x5Kdc5znGevNbf2iL3o+0J70XluF0Pb5VO2qwkkx1qcyqwwKjC0LzE/IcrOe9PywqvNPBaRNPcuI0QZZmIAA9STwK4l/id4OHiNPDC3aNM8JnMispiVQcYZ84BPYVpGlOd+SNyXNR+JnoGTRlqzY9W0uWyfUo7mJreIEvKrqUXHJywOBiuOX4sfD9Y5JLjUooRHM0GJDgsy9So6lT2PQ0QoVJ35It28glUjH4nY9Dyx70fN615v4b+K/gnxa6W2j3YNxIWCwOCsh2Zzx9Bkc9Kr618U/Dug31/YXzPv061W7mKAMNjMEAXB5bJ5HatVg63Nycjv2I9vC3NzaHp5LetNLkd68zs/iz4J1DULTSrK9We5vCuyOJTIV3jI8zaCE685PFdVrvibSfD1zY2uosd+oXAt48Y4ZgTlskYXjrUyw1SMlGUXdjVWLXMmdBvajL9c15xqHxe+HGl302m32orHNA5jkXY5wy8EZC4NbWq+OfD2keFW8ZTy77Dy1kV0GS4bhQoOCST0FN4WsrXg1fbTcFVg72lsdWXkHemGWT1ry25+Nnw7h0qPVzeM8Lv5RKRO5STaG2PgfKcH/CtbR/Hmg+I9Iudc0eSSS3tGdZcxsrAou5htYAk4rT6pWS5pQaXoS6sdlI7gzS44aozcTD+I15rdfFnwNY6NFrVxfIyTwmeGMZ8x1BwQFP8AECMYPeun8M+L/C3jBCdAu0ndI1kdAfmQP0DDse1EsNUhHnlB272JVRSfKpanQm4n7MaiNzcD+M15TefG34d2kskL3Uv7uQxMRBKV3qcFQduCc1Jp3xZ8F6xqlvo9ncSi4um2RLJBIgZuuMsoFbrBVrXdN29DJ1o7KR6h9ruO7mkNzcHo5qrtk7ilzjg1hyovmZL9puR/GaQ3tyP4zTCwNRMMnIpqK7EuT7n/0PtaGRj1q6CpFVNoQcUzcwNd7V9jjvYts2OlIHNRrk1MF4qCh6tmpA3tUOMU8A1LKRMpqTcR0qEVIGA61DKR5v8AGGQ/8Kw1wnvaMPzIFfImq+FfD8EupCG1RRDNpATGeBcJ+9A5/iPWvtPx/wCGrrxn4al8O2V2LMTkCVigfdH3X2ycHPtXjVx8AvEl0Zmk8QZNwYGk/cDk2wxF3/hH596+hyzFUqNJqc7O/n/d7LyZ5mMozqSXLG/3eZL8NrOzt/AXi3RYhHFAl7fRKJCRGqBMDcRzgAfWvkHRpDdSw+WUDG6LYj3+aFEfBA/uDr1zmvvLwf8ACu90Ow1fSfEV/wD2hbauzPKip5ZDyZ8xsjn5uPpiuOu/2erO5S4tmvESDNy9tGsf+reZUSMsep2BencnNdmFzGhTqVeaekmn17HPWwlWcIWjtc8c/Z4tNcn8cxS2ZxbIkzXBfJUg4A2jOA+cc46ZzVbxPp/h+fxrr0kGkXEVhDZO8zMxSSJt2DOqsfmDtgAE4wc19H+B/hXf+F/E9v4gvru2lFtavbKlvb+SW3beWOeSMU7U/hVrOvT6/earqSSS6vbC0hKx7RFGsm9dwHUjpxRUzKj9ZlVT0aS69/x0COFqexjBrW7fTsfNelXN5p50q2muJVsHu7ZQkH2WORvmBXeYmLkeufx5rrv2gri21T4h6dpWmWRubyJY/O+YgShiSkIGcAkZ5HPNeixfAjV3awju9RtPKs54pf3NmkcjCIg43jk575616h4y8Cx+JdQ0vUInSBrG9W6kbb80iqpULuHORnjNZTzGiq8KsXspbXW+1+5pDC1fZSjJdj5kn8aeL1uoUstQiMDyXET4so2Mf2aISSKmSTJtzszkZIrpfizDLe/CnQNZvLwXkpu45EmixboyyBmX5eVUqAOo4INekad8IINL1/Tp7W7B0rTVm2WzpmRnnUrIXk77s56VdufhRZy6No3hiO5Z9N0u5ed45gGaQENtTIwAFLH8Kh4zDqpTnHpq9PXy328tS1Qq8sk+vn6HwvpWo3sdjJbXQnvYVdb6S3EqiMyeU5MzuOdynBC19ZfCuz1C6+Fd+1hLPY39wXuHu5CkjvK6BzIFGcKQMAHnvVux/Z40r+ztStdWmjupJ4kisn8sp5PloyozBTh25GT3xXqHhj4f6P4S8LtoGlosL3EIS4ljBBeTy9hk5Jwe9a5jmmHq0+SjvddNP6+Q8PhKkZXn2PjLxT4mGraZocd5d7ftOniS7jV0iifBcspRV+R3wDu6N6V65+z68812t0mrpcRS6fGTZearSxyB8ElQBhQAAM881asv2bVW3i0W81IPpwKvNiFRcSOv8PmnO2MAcAe9ek+AfhUnw71qefSroSafLGQkMsamZGJBwJgAxQehqcXjsPLDyo05fh5+m/8AluRRw1WNRVJo+NtUtdZm0syxx3L2sGrXL4LqsDMJOcKCJGkHHToOldp4Rj1e21Hwo+pRySRzavJJHdPOZBJ8m0qqN8yBe+epr1u5+CuuyQXGmJqNnJZS3c11HHPbb2jaZsnD5BB6dDVjw98F9b0zVNLudW1n7TaaVcPcxQCM53uMH5mJODXoVMzw7pOPMuvR9U/xu/Q544Woql7fl3PdHmRsgVWZcmrLwKrZFRHivj1boeu/MhC4pcgcU4k44qIgmrIP/9H7XXJODT9tKTHEhlk4AFc9PdNKxZjgegr0Ernm1aiprU6MIwFPANZGm6kzI0LDdt5BrnPiB41vvCWkRXGm23n3E7lVyCVQKMsxAqqdGdSapxWrB4imqTrSeiPQEBPFS7K43wJ4mvfFPh1NT1C3+zzhyjqAQDgAhhnnBBrsxk9axq05U5uEt0b0qkakFUhsxyqKr6g13bwB7GD7QxPK7wmB65NSMcVy/jHVdR0jw3PqGmkCZSiqWBYDe4UnA64BqIRcpJI0crJjH1PxAG/5BuP+28dHinXdQ0XwbeazCBFcQwbwDhgrenoa8YvfHPjhNCtryB1aUSSJKVh/uojLuBJ9SeOte/aPNHrfhq2lvgsourZTICMBt6/NxXXWp+z5ZSStfp/wTGEua6TPKtB+IetX7XVvcSqJYtOaZVdMfvs/xFcjAB4H581U8KeM/F+t6rcWd60JSKGXBCbcSKisnOfru7V7RBYWNtci7giVJBGIgw67Achfpmn2umaZa2s9pDCojuWZpRyd5cYYnJzyOKl1qavaG4KnPS8jxvwN408Ra5q6WuoyR7GilkICFRlUXaAxOPvbvXIrG0L4m+KLnxJb6TM8ckEtwkZcIM7S2Dgg4OecH2zXsdr4L8I2E63Njp8MUqfddVwRkY9fQ0QeEfD1tJHJbWcUZhYOhVcYZV2g++BxzWrrUW2+UhU6iS1PJdN+KniS58U/ZpDbGzmuViSPB3qpcL97PUg5+tczqPxZ8bDXv7NtHhdFv5ISAgyYxKEUZz6Z5r3qHwJ4QhlWaPTbZXUhgwjGQQcg5+tX5vCXhe7mNxcWEDOeS2wD09Megpqvh4u6gP2dVqzkXNU+3w6dcSaeAZ0jYxhgWG4AkZA5P0FeSeHPGHiy91RwWW4tPsn2su0OzaSHAXIc4XcnXBPUV7oXbOax49G0yGWeaG3RGuFCSlRjcozwfbk9PWuSnViouMle5rODbTTPHPCHjzxtqt1DNcxC4tyhSTZAyDeFZy288DHyjHfNcr4M+KfjLxB4t0/S5pYpYJ2KygJggfMxOc9VAAr6Q03SNN0i0FlpsKQRA52IMDJ6n61l2Xg3wrp1zHd2VhBHJFjYyrgjGefrz1rp+sUfe9zfb8TP2VT3fePBbD4o+Nbjxjb6U0kTQS3QgKqgAK+Yy8EnIO0V3D+M/GKeNhoM8cSROHKp5UjDYJQqtvXPVec9B3r0dPCPheOcXMdhAsgKkMEGQVIIIPYgjtTG8IeF2uvtzWURmB3b+c5znrn1pSr0W9IdOwlSqJayPHvFnjfxTp2viws5MQLNIJdqxFljVwqktuIXOerYr2m7nvLe3MsURkcAEJkLk+mTxVK68IeF724a5urGJ5HJLNggkk7jnBGeea6d2DLis6lWDUVGO25cab1uzi11bXZODph/7/x/41q2bXs6M17b/ZyMYBdXz/3zWky+gphzjmpc09lb7/8AMSi1uysVxTamIpu007iaP//S+w9autqpEvfJ/KsIMzYBq9qsJuYIruPlWG36Gqdvu8wk4Crksx6BR1J+gr14pKOh8xXm51Hc6HSYljhaZh944H4VyPxCncW1suMhmcY9sCuU8QfFoLJ/ZvhqLd5fG7buJ9/QV53qXi7xZq5RdSQusZJUYUYz16V6uFyurzqrWSS7Pc48TmuHjSdCm7vv0PoT4f3bnR2BHSUgfQKoFegDMg4r5P0jxj4k0qHyLRCqFtxBAPJr1jwr8TFvLhNP1mPync4V8YBrlxuWVIylUpK68jty/NqDjGjKVmd/4i069utEubfT2ZZ3TCFTtbqM4PY4zXEzW/xQQOsM0BDE7cqnygEEfxc9xz6V6nI/OBUQz3rx4VWlayZ9BKKbPJZovinIgtmki+b+NNi/xd8k9umM981NpKeMocW9/MHBkhCOJEK5WYtIpA5wY2A+oxXqDqc8V5XbeAL+z1C3uLFo0SG7mmGSTtjkkDkbSCCSBjPBHrXTCpGSalZfIwlFp6XPTbi5ghu4rQ53TB2X0wmM5/Op9wNYepQhvEmmMZCnyz/KMYbAXjn1/pXSlVHSuN6JeZ0LVsrU8cdqeOCaTK0h2AYpe+RRzRyPzpDF3UuRikz60tIBuR0opTwaOtMBgJppJ6VPjimEc0XFYiyOmKDUu2msKdxWIcc1Gy1Y4zTWqkyWisVpu2piM0BTiquTY//T+qdHvg2+ym5RxuHsyn/CqPxBvRp/gu/NkAhZFGe5BYA/pWdpkc32tGx0Bz+VXPGVuk/hS7E3OVX9GFfQU4xVeD81+Z8TSqzqYOp3s/yPPf2f9LtNSsrvVr6NZJEYAbhkDdkk4PevW/DvjPwN4p1D+zdJTzZPnwTAQh2HDfMVxxXDfAhI7fRdRjQEgMnA6/dPSuK8M38nhnXbefwymqnTbO2uZdStrlDhScsgRcAbyx7E13Y6h7bEV027q1tdNv6t5ndlTjHCUmorW9/vPbta8ceBNB1n+wbxAZ1MYk8uHesZlOE3sowufevLPi5JZ6H4ms2s4xHvVHIUYGdzKTj3FcprGna9H4p1i900X8V/qV5aXWnrGp8mSJgu7zcgj5BkEE8V2XxttUk1qxlc/MIl/wDRhrXA4eFLEUlF3vF318k/u1t8jmzuXNhZO1rSVvvPoDT7jz7KCQ9WjQ/morQxnkVzun38MGn28aDcwiTPoPlFXrTVJJrlYXUYbjjtXys4u7sj6WFaNoxb1NlV4ryiVPGsNxbxbpnC3MmHwuGHnrjzMD7vk7se9esnnpXN6v4jtNHv7WwuEYm6JAfgKuCF5JI6lhgUqMmnZK5vNK2rMzUo7i48UWAmjXy0juGjbPzbsIM47da1JJXifBJ796xtdv1g8U6fCrDcIbksCegITBP1xWHD4judeuGt9Ah3bCPMnmysaBhkEDq5I5AHHqa7aVGVSKlbRL7tWctWooSt1Z2RufMzhs44OD3qMQs45LYPua5LTvBd1pitLb6m6SkAbggKuQSd0isTljnGQRxWl/aPiOwOy9tFu4x/y0tT834xtg/kTW0qMb2ozT/D8zFVJWvUjb8To1Rwc7m/M1IAwOcnj3PasS38U6ITi6l8hx1SVSjD8CKrJ4zs9QYw6XZzzsV8xCoUKyElQ2ScAEjoefasfq9Z39z9DT21NfaOl8wjgk/nTH3SH5SfzNcmV8WXrZxb2a+5MrfpgfrVqLQJpjnU764m/wBlCIl/Jef1qnRjHWU18tf+B+JCqyltH9P+Ca0uoWVtcJZ3MwWWXO1S3J9aub8ngk/jWBN4O8PXEiu0b4AUMu9sPtOVLZJJ2k5HNI3gzSFO+3kuYD/0znfH5MSKGqDS9539P+CP972X3/8AAOiy2Mgn8zUZdz3P5msb+wLlF2QaldqP9oxt/NKxNS8J63dSRtDq0gC5GWUKVJIO8bMBiMYw3HNOFKk3Z1Evk/8AIcpzS0idmgYfxH8zQ8bNjBbjHc9qwhb+KrMfLJbXoH94NC36bl/lUn9vXFqP+Jhp1zH6tEBMv/jhJ/Sp9jJ/A0/n+j1/AfOvtaG2sGBjJ/M0kidRk857nvXOp4y0Se5S0jMgZiqndGyhC5wgbIGNx4Fb5fc2KznSqQfvqw1OMvhdzXUfKB7CpQmRQq/KD7U8dK4mzsSP/9T6wml02O8dLNl/P9K5bxl9qm8OXkEQ/wCWRP5c/wBKyo7O5tLjyZeGFd5oD2lzBLDqGGQqV59G4NfUToxoWqRd7WPk3H2ylSXu3ueSfArWLeGzvdLnmWG4mVXiL9DgEfjg4OK9h+w+JhtY63BnA3fu1wT69a+Tl0J7fxL/AMI1NIIWhuDCZDwAhOUf6FSK0fiv4Zm8Ii2j0u/eVZvvtnlfyPevYxmX0atdVI1NZq9uW+y7nlYDMa1Gi6MqWkHa/Nbd9j6hhi1mCVZ7vWIZNrKWGFUEA8j8RXh3xb16x1vxBCmmyiRIFWMuOhbcScfSuE+F3hefxhdm11O7aNVRm3Z5fBxxmteLwhJN48j8K20gnjSbLyL08tPmY/lx9avB4Ojhq0p1J3lGN9rWTMMwxlfF040o07RcrXve7R9I6avk2cS5ydij9K6vSoVLeeRwOn1rnJPsNjOdxMiLxtXt7ZrrLS6iubdJYBhCOK+LrXeq6n1uEUXOzeq6Gi53cLWJqGh22pTRT3i7zCdyAkgZyCMgHBwQDzW0jCuU13RtU1HWLG+sptkcBG4biMfOrE477lBXnpmuaGj3sevLVDtSWL/hItPZ1BbybnJxzwEqaGwtbNSljGsSsxYhBjJPU0mpaLqdzq8Go29wqJCsihSuT8+3/Csy81ZdNvFsb3UreORv4WUA+vPpW0JO1osznFPVm2qN3qQBVrAi1q3vbwWFtqVu05LKEC85T7w/Ci+e70tBcajqEMMbOEBdMDcxwB9TV2ezM7dUbjl3PTP61TgsYoHeSGJY2kOWKqAWPvis6PW7YRJPHqduyvu2kLnOw4bH0NX11C4O8/bYSEUMw2jIB6Z+tHNJKy/UTgnqzQSPHJqbZnoKy5b5USJpL+BPOUvHkD5lUZJH0FW4oNUkgE0F5GUddysEBGD0IrJy6s0UC15R7ilKnvWANZWWN5E1O3Kxgsx29APWltjqGpoZbK/idQcEqmRmnr1Cy6G5jHSk2k9qyXg1fT7eS7vb+JIogXZinAUckmqEWuR3ttNd2eqQSR2wDSsqghQRu59sGnZvYGrbnSFDTDGRziqcceryAMLuMg9wgNS3C6ha2z3dzdxJHEpZ2ZMAAckmlewciZFLp1lPcpeTwq8sf3HIyR/nt6Vaxg9K51Net5hI8OrWxWDHmYXO3ecLn6nitqxku9Sg+0WV7FKhONyoCMirlKVve/UlQXQ2g5wKkGcU2KKRIUWdgzgfMQMAn6U7Nczsbn//1foS71yHUVCqo46HuKoFpfLYoTyecV6PN4Q0u+m3eWEJ5JXitG18H6PbAr8x9cmvqPr9CEbRTPnJ4GtUbvY8O8WeCX8RrBqtg4gv4owm5vuyKOiv9OxrzW+8OeLYVMep2byDplSHU19UQat4JuZZba3u0ZoFJYA9lXcceuBXP2vib4fa9djTLO6MjmIzdwNiqHJz/unNdOGzerSXKouy7rY48VkdKs+aTs+6Z8+aXoXie4cR6fatFjgMx2AflzXsnhXwlN4ftpbov513NgSSDgKvXavtnr61v+Hdd+HurGf+yrvd9nQySZJGEHU89hmt+z8V+CLnT57i0uleOJUaTGcgOcKcfX0";

        var MATERIAL_WELCOME_IMAGE = "./page-assets/images/c0ba40030f6529db80eccdbe105243f17775cf24f708c670c6a6205cc3ea1462.png";
        var materials = {
          "租户素材": [
            { id: "t1", name: "广德通用复诊提醒", group: "患者随访", summary: "请按计划完成复诊并携带近期检查报告。", type: "文本", purpose: "会话 / 推送", updated: "2026-08-06 10:12:30", pinned: true, content: "请按计划完成复诊并携带近期检查报告。" },
            { id: "t2", name: "低血糖处理指南", group: "健康宣教", summary: "出现低血糖症状时的识别和快速处理建议。", type: "网页", purpose: "会话 / 推送", updated: "2026-08-05 09:30:00", pinned: false, content: "https://health.example.com/hypoglycemia" },
            { id: "t4", name: "健康服务宣传图", group: "健康宣教", summary: "健康服务宣传图.png", type: "图片", purpose: "会话 / 推送", updated: "2026-08-05 08:30:00", pinned: false, content: "健康服务宣传图.png", thumbnail: "patient-profile-assets/profile-avatar.png", metadata: "PNG · 64 × 64" },
            { id: "t5", name: "健康课堂视频", group: "健康宣教", summary: "日常健康管理.mp4", type: "视频", purpose: "会话 / 推送", updated: "2026-08-04 16:20:00", pinned: false, content: "日常健康管理.mp4", metadata: "MP4 · 03:12 · 24.8 MB" },
            { id: "t6", name: "随访关怀语音", group: "患者随访", summary: "随访关怀.mp3", type: "语音", purpose: "会话", updated: "2026-08-04 15:20:00", pinned: false, content: "随访关怀.mp3", metadata: "MP3 · 00:36 · 576 KB" },
            { id: "t3", name: "出院随访须知", group: "患者随访", summary: "出院随访须知.pdf", type: "文件", purpose: "会话 / 推送", updated: "2026-08-04 14:08:20", pinned: false, content: "出院随访须知.pdf", metadata: "PDF · 5 页 · 2.4 MB" },
            { id: "t7", name: "健康打卡小程序", group: "患者随访", summary: "健康助手 · 每日健康打卡", type: "小程序", purpose: "会话 / 推送", updated: "2026-08-03 09:00:00", pinned: false, content: "pages/health/checkin", metadata: "小程序 · pages/health/checkin" }
          ],
          "平台素材": [
            { id: "g1", name: "随访开场白", group: "患者随访", summary: "您好，我是随访助手，很高兴为您服务。", type: "文本", purpose: "会话 / 推送", updated: "2026-08-05 17:04:43", pinned: true, content: "您好，我是随访助手，很高兴为您服务。" },
            { id: "g2", name: "夏季健康提示（推送）", group: "健康宣教", summary: "夏季防暑健康提示，注意补水防中暑。", type: "文本", purpose: "推送", updated: "2026-08-06 08:00:00", pinned: false, content: "夏季防暑健康提示，注意补水防中暑。" },
            { id: "g3", name: "慢病宣教网页", group: "慢病管理", summary: "慢病管理宣教页面，包含饮食与运动建议。", type: "网页", purpose: "会话 / 推送", updated: "2026-08-05 12:00:00", pinned: false, content: "https://health.example.com/chronic-care" },
            { id: "g4", name: "血糖解读图", group: "慢病管理", summary: "血糖解读示意图，帮助患者理解指标。", type: "图片", purpose: "会话", updated: "2026-08-04 10:20:00", pinned: false, content: "" }
          ]
        };
        // Separate synthetic personal fixtures; changes never mutate public rows.
        materials["个人素材"] = materials["租户素材"].map(function(item) {
          return Object.assign({}, item, {id:"personal-"+item.id, group:item.id==="t1"?"复诊提醒":item.group==="患者随访"?"随访关怀":item.group, name:item.id==="t1"?"复诊资料提醒":"我的·"+item.name, summary:"个人素材 · "+item.summary, purpose:"会话 / 消息推送"});
        });
        var materialThemes = ["血糖记录", "饮食管理", "运动打卡", "用药提醒", "复诊准备", "足部护理", "睡眠管理", "体重管理", "低血糖识别", "健康教育", "检查报告", "居家监测", "随访问候", "就医准备", "家庭护理", "健康档案", "异常上报", "随访计划", "营养搭配", "心理支持", "康复训练", "慢病知识", "服务入口", "复诊提醒", "指标解读", "患者权益", "安全用药", "运动处方", "控糖食谱", "日常问答"];
        var materialSubjects = ["糖尿病", "高血压", "冠心病", "慢病管理", "体重管理", "术后康复", "健康宣教", "患者随访", "用药管理", "复诊服务"];
        var materialGroupNames = ["患者随访", "健康宣教", "慢病管理", "用药管理", "复诊服务"];
        var materialTypes = ["文本", "图片", "网页", "视频", "语音", "文件", "小程序"];
        var materialPurposes = ["会话 / 推送", "会话", "推送"];
        for (var materialIndex = 8; materialIndex <= 350; materialIndex += 1) {
          var materialTheme = materialThemes[(materialIndex - 8) % materialThemes.length];
          var materialSubject = materialSubjects[(materialIndex - 8) % materialSubjects.length];
          var materialGroup = materialGroupNames[(materialIndex - 8) % materialGroupNames.length];
          var materialType = materialTypes[(materialIndex - 8) % materialTypes.length];
          var materialPurpose = materialPurposes[(materialIndex - 8) % materialPurposes.length];
          var materialDate = String(6 + materialIndex % 24).padStart(2, "0");
          var materialName = materialSubject + "·" + materialTheme + "（" + materialIndex + "）";
          var materialSummary = "围绕" + materialSubject + "的合成患教内容：" + materialTheme + "，用于患者沟通、随访记录与健康宣教。";
          var materialContent = "面向患者的非诊疗性健康管理说明：" + materialTheme + "。如出现持续或加重不适，请使用人工复核或合规就医入口。";
          var materialItem = { quickReplyHidden: true, id: "t" + materialIndex, name: materialName, group: materialGroup, summary: materialSummary, type: materialType, purpose: materialPurpose, updated: "2026-08-" + materialDate + " " + String(8 + materialIndex % 10).padStart(2, "0") + ":" + String(materialIndex % 6).padStart(2, "0") + ":00", pinned: false, content: materialContent, metadata: "合成演示素材 · " + materialSubject + " · " + materialTheme };
          if (materialType === "图片") { materialItem.thumbnail = "assets/welcome-health-service.png"; materialItem.metadata = "PNG · 1676 × 938 · 合成演示素材"; }
          if (materialType === "网页") { materialItem.content = "https://health.example.com/material/" + materialIndex; materialItem.metadata = "网页链接 · 合成演示素材"; }
          if (materialType === "视频") { materialItem.content = materialName + ".mp4"; materialItem.metadata = "MP4 · 02:10 · 8.2 MB"; }
          if (materialType === "语音") { materialItem.content = materialName + ".mp3"; materialItem.metadata = "MP3 · 00:42 · 680 KB"; }
          if (materialType === "文件") { materialItem.content = materialName + ".pdf"; materialItem.metadata = "PDF · 4 页 · 1.8 MB"; }
          if (materialType === "小程序") { materialItem.content = "pages/health/material-" + materialIndex; materialItem.metadata = "小程序 · pages/health/material-" + materialIndex; }
          materials["租户素材"].push(materialItem);
        }
        var labelRows = {
          "个人标签": [
            { name: "个人健康管理", type: "一级标签", sort: 100, level: 1 },
            { name: "用药提醒", type: "二级标签", sort: 90, level: 2, parent: "个人健康管理" },
            { name: "降压药用药提醒", type: "标签名称", sort: 100, level: 3, parent: "用药提醒" },
            { name: "降糖药用药提醒", type: "标签名称", sort: 90, level: 3, parent: "用药提醒" },
            { name: "复诊随访", type: "二级标签", sort: 90, level: 2, parent: "个人健康管理" },
            { name: "复诊时间提醒", type: "标签名称", sort: 100, level: 3, parent: "复诊随访" },
            { name: "检查报告提醒", type: "标签名称", sort: 90, level: 3, parent: "复诊随访" }
          ],
          "租户标签": [
            { name: "A医院患者分类", type: "一级标签", sort: 100, level: 1 },
            { name: "随访阶段", type: "二级标签", sort: 90, level: 2, parent: "A医院患者分类" },
            { name: "首次随访", type: "标签名称", sort: 100, level: 3, parent: "随访阶段" },
            { name: "持续随访", type: "标签名称", sort: 90, level: 3, parent: "随访阶段" }
          ],
          "平台标签": [
            { name: "肿瘤", type: "一级标签", sort: 100, level: 1 },
            { name: "随访计划", type: "二级标签", sort: 90, level: 2, parent: "肿瘤" },
            { name: "早期随访", type: "标签名称", sort: 100, level: 3, parent: "随访计划" },
            { name: "进展期随访", type: "标签名称", sort: 90, level: 3, parent: "随访计划" },
            { name: "治疗方式", type: "二级标签", sort: 90, level: 2, parent: "肿瘤" },
            { name: "靶向治疗中", type: "标签名称", sort: 100, level: 3, parent: "治疗方式" },
            { name: "免疫治疗中", type: "标签名称", sort: 90, level: 3, parent: "治疗方式" }
          ]
        };
        var recipients = [
          { id: "r1", name: "周伟辉", diagnosis: "--", phone: "131****9681", gender: "男", age: "34岁" },
          { id: "r2", name: "唐嘉荣", diagnosis: "--", phone: "135****7226", gender: "男", age: "31岁" },
          { id: "r3", name: "柯小源", diagnosis: "高血压", phone: "183****6955", gender: "男", age: "--" },
          { id: "r4", name: "谭海煜", diagnosis: "肌肉量不足", phone: "191****9606", gender: "男", age: "41岁" },
          { id: "r5", name: "郑小源", diagnosis: "测试数据", phone: "136****5374", gender: "男", age: "55岁" }
        ];
        var memberRows = [
          { id: "m1", assistant: "张医助", project: "广德慢病项目", doctors: ["张医生", "李医生"], assigned: true, max: 100, current: 18, transferable: true },
          { id: "m2", assistant: "王医助", project: "广德慢病项目", doctors: ["王医生", "陈医生"], assigned: true, max: 80, current: 25, transferable: true },
          { id: "m3", assistant: "李医助", project: "中山肿瘤随访", doctors: [], assigned: false, max: 60, current: 12, transferable: false },
          { id: "m4", assistant: "陈医助", project: "广德慢病项目", doctors: ["赵医生"], assigned: true, max: 50, current: 47, transferable: true },
          { id: "m5", assistant: "赵医助", project: "中山肿瘤随访", doctors: [], assigned: false, max: 60, current: 8, transferable: false },
          { id: "m6", assistant: "周医助", project: "广德慢病项目", doctors: ["张医生", "陈医生"], assigned: true, max: 80, current: 20, transferable: true },
          { id: "m7", assistant: "郑医助", project: "中山肿瘤随访", doctors: ["赵医生"], assigned: true, max: 60, current: 10, transferable: true },
          { id: "m8", assistant: "黄医助", project: "广德慢病项目", doctors: [], assigned: false, max: 50, current: 0, transferable: false }
        ];
        var doctorOptions = [
          { id: "d1", name: "张医生", phone: "138****6698", hospital: "A医院", department: "内分泌科", title: "主治医师" },
          { id: "d2", name: "李医生", phone: "139****2286", hospital: "A医院", department: "内分泌科", title: "副主任医师" },
          { id: "d3", name: "陈医生", phone: "136****7812", hospital: "A医院", department: "心内科", title: "主治医师" },
          { id: "d4", name: "赵医生", phone: "137****5036", hospital: "A医院", department: "呼吸内科", title: "主任医师" }
        ];
        var assistantOptions = [
          { id: "a1", name: "王医助", account: "wangyizhu", phone: "138****6698" },
          { id: "a2", name: "周医助", account: "zhouyizhu", phone: "139****2286" },
          { id: "a3", name: "郑医助", account: "zhengyizhu", phone: "136****7812" }
        ];
        var chatMessages = [
          { side: "other", name: "王德华", time: "2026-08-24 09:08", text: "张医生，您好！血压今天早上量了 135/85，比昨天高一点，需要调整用药吗？" },
          { side: "self", name: "AI发送", time: "2026-08-24 09:09", text: "您好，我先记录您今天的血压和感受。关于是否调整用药，我不能直接下结论；请问最近有没有按时服药？有没有头晕等不适？" },
          { side: "other", name: "王德华", time: "2026-08-24 09:12", text: "按时吃了，偶尔有点头晕，昨天没休息好。" },
          { side: "self", name: "随访医助发送", time: "2026-08-24 09:16", text: "已记录您反馈的轻微头晕。是否停药或调整用药需要医生结合情况判断，我先转交医助复核；如不适明显加重，请使用合规就医入口。" },
          { side: "other", name: "王德华", time: "2026-08-24 09:18", text: "好的，谢谢医生。" }
        ];
        var chatHistoryRecords = [
          { role: "患者", groupSender: "林女士", kind: "文本", daysAgo: 0, time: "09:15", text: "今早的测量记录已经补充到健康档案，请帮我确认是否收到。" },
          { role: "医生", kind: "文本", daysAgo: 0, time: "09:28", text: "已经收到，建议继续按原计划监测，复诊时一并带上记录。" },
          { role: "医助", kind: "文件", daysAgo: 1, time: "16:05", text: "文件：复诊准备清单.pdf" },
          { role: "患者", groupSender: "吴先生", kind: "图片与视频", daysAgo: 2, time: "10:42", text: "图片：本周健康指标截图" },
          { role: "医生", kind: "链接", daysAgo: 3, time: "14:18", text: "链接：门诊预约指引，按页面提示选择合适的复诊时间。" },
          { role: "医助", kind: "小程序", daysAgo: 4, time: "08:50", text: "小程序：健康指标登记，您可在这里继续填写每日数据。" },
          { role: "患者", groupSender: "林女士", kind: "文本", daysAgo: 9, time: "11:06", text: "下周复诊之前，需要先整理最近一周的监测结果吗？" },
          { role: "医生", kind: "文本", daysAgo: 9, time: "11:20", text: "请整理晨间测量结果和目前的用药清单，方便复诊时核对。" },
          { role: "患者", groupSender: "吴先生", kind: "文件", daysAgo: 33, time: "15:31", text: "文件：上次检查报告.pdf" }
        ];
        var state = {
          openMenus: {},
          materialTab: "租户素材",
          materialType: "全部",
          materialGroup: "全部素材",
          materialGroupOrder: {
            "租户素材": ["患者随访", "健康宣教", "慢病管理", "用药管理", "复诊服务"],
            "个人素材": ["复诊提醒", "健康宣教", "随访关怀", "患者随访", "慢病管理", "用药管理", "复诊服务"],
            "平台素材": ["患者随访", "健康宣教", "慢病管理"]
          },
          materialDraggedGroup: "",
          materialSearch: "",
          materialApplied: "",
          selectedMaterial: null,
          materialDraft: { title: "", group: "", scope: "个人素材", purposes: ["会话"], type: "文本", text: "", webTitle: "", webUrl: "", webDescription: "", miniTitle: "", appId: "", path: "", uploadName: "" },
          materialMode: "create",
          labelTab: "个人标签",
          labelSearch: "",
          labelApplied: "",
          labelCollapsed: {},
          messageStatus: "全部",
          messageFilterDraft: { taskName: "", creator: "", sendType: "全部", createdStart: "", createdEnd: "", sentStart: "", sentEnd: "" },
          messageFilterApplied: { taskName: "", creator: "", sendType: "全部", createdStart: "", createdEnd: "", sentStart: "", sentEnd: "" },
          messageTask: { name: "糖尿病饮食宣教", content: "请查阅糖尿病饮食指南", audience: "诊断含糖尿病", target: 12, success: 8, failed: 2, sendType: "立即", status: "进行中", sentAt: "2026-08-01 10:30", createdAt: "2026-08-01 10:00", creator: "张医生" },
          messageDraft: { taskName: "", sendType: "立即发送", sendAt: "", diagnosis: "", doctor: "", ageMin: "", ageMax: "", gender: "不限（全选）", phone: "", name: "", contentSource: "不引用素材", content: "" },
          messageRecipientSearched: false,
          messageMaterialOpen: false,
          selectedRecipients: [],
          patientArchiveDraft: { name: "", phone: "", project: "", scene: "", doctor: "", tags: [], diagnosis: "" },
          patientArchiveApplied: { name: "", phone: "", project: "", scene: "", doctor: "", tags: [], diagnosis: "" },
          patientArchiveTagSearch: "",
          patientArchiveTagOpen: false,
          patientDetailId: "pa-1",
          patientDetailTab: "病例时间轴",
          patientTimelineDetail: null,
          patientDetailPhoneVisible: false,
          opsPatientDraft: { name: "", phone: "", diagnosis: "", doctor: "", hospital: "", archived: "", medical: "", project: "", scene: "", registeredStart: "", registeredEnd: "" },
          opsPatientApplied: { name: "", phone: "", diagnosis: "", doctor: "", hospital: "", archived: "", medical: "", project: "", scene: "", registeredStart: "", registeredEnd: "" },
          moreMenu: false,
          selectedMembers: [],
          memberPage: 1,
          memberTransferOn: true,
          modal: null,
          chatSelected: "王德华",
          chatDoctorSelected: "张医生",
          chatReadOnlyContext: null,
          chatWorkQueue: "human",
          chatSubjectSelected: null,
          chatConversationSelectedKey: null,
          chatBasicScope: null,
          chatDraftScope: null,
          chatMessageSending: false,
          chatOriginFocus: null,
          chatArchiveTab: "病例时间轴",
          chatArchiveMetric: 0,
          chatArchiveTimelineDetail: null,
          chatArchiveEditMode: null,
          chatArchiveFileOriginal: null,
          chatAiAutoStartedKey: "",
          chatArchiveTabsExpanded: false,
          chatPatientPhoneVisible: false,
          chatPatientBasic: { name: "王德华", gender: "男", phone: "138****5605", birthDate: "1968-06-15", height: "", diagnosis: "2型糖尿病" },
          chatArchiveScene: "慢病随访",
          chatDoctorSearch: "",
          chatDoctorFilterOpen: true,
          chatDoctorPanelCollapsed: false,
          chatCollapsedProjects: {},
          chatConversationTab: "全部",
          chatConversationSearch: "",
          chatConversationSearchOpen: false,
          chatConversationNewestFirst: true,
          chatWorkbenchCollapsed: false,
          chatWorkbenchWidth: 556,
          chatMaterialScope: "个人素材",
          chatMaterialTenant: "guangde",
          chatMaterialGroup: "全部素材",
          chatMaterialType: "全部类型",
          chatMaterialCollapsed: {},
          chatHistoryOpen: false,
          chatHistoryTab: "全部",
          chatHistorySearch: "",
          chatHistorySender: "全部",
          chatHistoryDate: "全部",
          chatHistoryCalendarOpen: false,
          chatHistoryCalendarMonth: todayLocalIso().slice(0, 7),
          chatQueryDraft: { name: "", content: "", startDate: "2025-09-10", endDate: "2026-09-10" },
          chatQueryApplied: { name: "", content: "", startDate: "2025-09-10", endDate: "2026-09-10" },
          chatWorkbenchTab: new URLSearchParams(window.location.search).get("panel") === "handoff" ? "患者交接" : "患者档案",
          chatPatientTags: {
            "王德华": ["糖尿病", "慢病管理", "复诊提醒"],
            "孙大伟": ["糖尿病", "慢病管理"],
            "慢病管理群": ["慢病管理", "群聊"],
            "刘德华": ["高血压", "用药提醒"],
            "糖尿病患者群": ["糖尿病", "群聊"],
            "陈建军": ["复诊提醒"]
          },
          chatMaterialSearch: "",
          chatFollowupDate: todayLocalIso(),
          chatFollowupContent: "",
          chatFollowupFormOpen: false,
          chatFollowupExpandedEntry: null,
          chatFollowups: [
            { date: "2026-08-23", content: "已提醒患者按计划记录指标，患者表示知晓。" }
          ],
          chatDraft: "",
          chatMessages: chatMessages.slice(),
          chatConversationReplies: {},
          rulesEditing: false,
          ruleTimePickerOpen: false,
          rules: { timeoutMark: true, sms: true, workEnabled: true, workThreshold: "15", workCountdown: "5", workTime: "09:00 - 18:00", offEnabled: true, offThreshold: "30", offCountdown: "10", privateChat: true, groupChat: true },
          toast: ""
        };
        var archivePageParams = new URLSearchParams(window.location.search);
        var patientProfileStandalone = archivePageParams.get("standalone") === "patient-profile";
        var aiSummaryStandalone = archivePageParams.get("standalone") === "ai-summary";
        var quickRepliesStandalone = archivePageParams.get("standalone") === "quick-replies";
        var patientFollowupsStandalone = archivePageParams.get("standalone") === "patient-followups";
        var followupNavigationHint = "";
        var quickRepliesEmbedded = archivePageParams.get("embedded") === "1";
        var quickReplyNavigationHint = "", quickReplySendStatus = "";
        function closeQuickRepliesPage() {
          if (!quickRepliesStandalone) return;
          quickReplyNavigationHint = "若页面未关闭，请使用企微或浏览器自带的关闭按钮。";
          render();
          try { window.close(); } catch (error) { /* The host may own closing. */ }
        }
        var archiveNavigationHint = "";
        function closeArchivePage() {
          if (!patientProfileStandalone) return;
          // Browsers may refuse to close a page they did not open through script.
          archiveNavigationHint = "若页面未关闭，请使用企微或浏览器自带的关闭按钮。";
          render();
          try { window.close(); } catch (error) { /* Keep the visible host-close instruction. */ }
        }
        var chatPatientBasics = {};
        function selectArchivePatient(name,conversationKey) {
          if (state.chatPatientBasic) chatPatientBasics[state.chatBasicScope||state.chatConversationSelectedKey||state.chatSelected] = state.chatPatientBasic;
          state.chatSelected = name;state.chatConversationSelectedKey=conversationKey||null;state.chatBasicScope=conversationKey||null;
          var identity=conversationKey&&conversationInbox&&conversationInbox.rows(state.chatDoctorSelected).find(function(row){return row.inboxKey===conversationKey;});
          state.chatPatientBasic = chatPatientBasics[conversationKey||name] || (identity?inboxBasicDefaults(identity):{ name:name, gender:"男", phone:"138****5605", birthDate:name === "王德华" ? "1968-06-15" : "", height:"", diagnosis:"2型糖尿病" });
          state.chatPatientPhoneVisible = false;
        }
        if (patientProfileStandalone || aiSummaryStandalone || quickRepliesStandalone || patientFollowupsStandalone) {
          selectArchivePatient(archivePageParams.has("patient") ? archivePageParams.get("patient") : "王德华");
          state.chatDoctorSelected = archivePageParams.has("doctor") ? archivePageParams.get("doctor") : "张医生";
          state.chatArchiveScene = archivePageParams.get("scene") || "慢病随访";
          state.chatWorkbenchTab = aiSummaryStandalone ? "AI小结" : quickRepliesStandalone ? "快捷回复" : patientFollowupsStandalone ? "患者跟进" : "患者档案";
        }
        if(archivePageParams.get("standalone")==="aggregate-chat"&&(archivePageParams.has("patient")||archivePageParams.has("doctor"))){
          selectArchivePatient(archivePageParams.has("patient")?archivePageParams.get("patient"):"王德华");
          state.chatDoctorSelected=archivePageParams.has("doctor")?archivePageParams.get("doctor"):"张医生";
          state.chatArchiveScene=archivePageParams.get("scene")||"慢病随访";
        }
        var shell = null;
        var toastTimer = null;
        var returnFocus = null;
        var nativeObserverQueued = false;

        function todayLocalIso() {
          var today = new Date();
          return today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0") + "-" + String(today.getDate()).padStart(2, "0");
        }

        function escapeHtml(value) {
          return String(value == null ? "" : value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
        }
        function currentRoute() {
          var route = window.location.hash.replace(/^#/, "").split("?")[0] || "home";
          if (route === "doctor-todos") { window.history.replaceState(null, "", "#my-todos"); return "my-todos"; }
          if (route === "conversation-rules" || route === "handoff-settings") {
            window.history.replaceState(null, "", "#home");
            return "home";
          }
          return route;
        }
        function isOpsRoute(route) {
          return Object.prototype.hasOwnProperty.call(ROUTES, route || currentRoute());
        }
        function icon(name, label) {
          return '<i class="fa-solid ' + name + ' ops-icon" ' + (label ? 'aria-label="' + escapeHtml(label) + '"' : 'aria-hidden="true"') + '></i>';
        }
        function button(text, variant, action, attrs, iconName) {
          return '<button class="ops-button ' + (variant ? "ops-button-" + variant : "") + '" type="button" data-action="' + action + '" ' + (attrs || "") + '>' + (iconName ? icon(iconName) : "") + '<span>' + escapeHtml(text) + '</span></button>';
        }
        function toolbar(crumbList, actions) {
          var crumbs = crumbList.map(function (item, index) {
            return '<span><span>' + escapeHtml(item) + '</span>' + (index < crumbList.length - 1 ? "<b>/</b>" : "") + "</span>";
          }).join("");
          return '<div class="ops-page-toolbar"><nav class="ops-breadcrumb" aria-label="面包屑">' + crumbs + '</nav><div class="ops-page-actions">' + (actions || "") + "</div></div>";
        }
        function toast(message) {
          state.toast = message;
          render();
          if (toastTimer) window.clearTimeout(toastTimer);
          toastTimer = window.setTimeout(function () {
            state.toast = "";
            // Expiring feedback must not rebuild an in-progress material editor
            // or dismiss its variable picker and text selection.
            if (shell && shell.querySelector('[data-bind="material.title"],.ops-modal.is-group-manager')) {
              shell.querySelectorAll('.ops-toast').forEach(function (item) { item.remove(); });
            } else render();
          }, 2500);
        }
        function navigate(route) {
          window.location.hash = route;
        }
        function openModal(modal, trigger) {
          if (state.modal && state.modal.type === 'material-groups') clearMaterialGroupHighlight(state.modal);
          closeMaterialHelpPopovers();
          state.modal = modal;
          returnFocus = trigger || document.activeElement;
          render(modal.type.indexOf("health-")===0 ? {preserveArchiveScroll:true} : undefined);
          window.requestAnimationFrame(function () {
            if (document.querySelector('.dt-dialog')) return;
            var first = shell && (modal.type === 'material-groups' ? shell.querySelector('.ops-modal [data-action="modal-close"]') : (shell.querySelector(".ops-modal [data-initial-focus]") || shell.querySelector(".ops-modal input:not([disabled]):not([data-ui-date-source]), .ops-modal select:not([disabled]):not([data-ui-select-source]), .ops-modal button:not([disabled])")));
            if (first) first.focus();
          });
        }
        function closeModal() {
          if (state.modal && state.modal.type === 'material-groups') clearMaterialGroupHighlight(state.modal);
          var focusTarget = returnFocus;
          var healthModal=state.modal && state.modal.type.indexOf("health-")===0;
          var materialParent=state.modal&&state.modal.parent;
          var materialFormReturn=state.modal&&state.modal.fromMaterialForm;
          state.modal = materialParent || null;
          render(healthModal ? {preserveArchiveScroll:true} : undefined);
          if(healthModal && focusTarget) {
            var focusAttributes=['data-action','data-health-key','data-metric','data-period'];
            var replacement=Array.prototype.find.call(shell.querySelectorAll('button[data-action]'),function(button){return focusAttributes.every(function(attr){return button.getAttribute(attr)===focusTarget.getAttribute(attr);});});
            if(replacement)replacement.focus();
          }
          if(materialParent||materialFormReturn){var materialGroupTrigger=shell&&shell.querySelector(materialParent&&materialParent.type==='chat-material-preview'?'[data-action="chat-material-edit"]':'[data-action="material-form-new-group"]');if(materialGroupTrigger)materialGroupTrigger.focus();}
          if (focusTarget && focusTarget.focus) window.requestAnimationFrame(function () {
            if (document.body.contains(focusTarget)) focusTarget.focus();
          });
          returnFocus = null;
        }
        function renderSidebar(route) {
          var activeParent = ROUTES[route].parent;
          return '<aside class="ops-sidebar" aria-label="主导航"><nav>' + MENU.map(function (item) {
            var active = item.label === activeParent;
            var open = active || !!state.openMenus[item.label];
            var routeAttr = item.route ? ' data-route="' + item.route + '"' : ' data-action="toggle-menu" data-menu="' + escapeHtml(item.label) + '"';
            var subnav = "";
            if (item.children && open) {
              subnav = '<div class="ops-subnav">' + item.children.map(function (child) {
                var childActive = child.route === route || (route.indexOf("material-") === 0 && child.route === "materials") || (route === "message-task-create" && child.route === "message-tasks") || (route === "patient-archive-detail" && child.route === "patient-archives");
                if (child.external) {
                  return '<button type="button" data-action="agent-admin" title="前往管理后台（原型演示）">' + escapeHtml(child.label) + icon("fa-arrow-up-right-from-square") + '</button>';
                }
                if (child.openInNewWindow) {
                  var newWindowUrl = new URL(window.location.href);
                  newWindowUrl.searchParams.set("standalone", "aggregate-chat");
                  newWindowUrl.hash = child.route;
                  var newWindowHref = newWindowUrl.pathname + newWindowUrl.search + newWindowUrl.hash;
                  return '<a class="' + (childActive ? "is-active" : "") + '" href="' + escapeHtml(newWindowHref) + '" target="_blank" rel="noopener noreferrer" aria-label="' + escapeHtml(child.label) + '（新标签页打开）" title="新标签页打开">' + escapeHtml(child.label) + "</a>";
                }
                return '<button class="' + (childActive ? "is-active" : "") + '" type="button" data-route="' + child.route + '">' + escapeHtml(child.label) + "</button>";
              }).join("") + "</div>";
            }
            return '<div class="ops-nav-group"><button class="ops-nav-item ' + (active ? "is-active" : "") + '" type="button" title="' + escapeHtml(item.label) + '"' + routeAttr + (item.children ? ' aria-expanded="' + (open ? "true" : "false") + '"' : "") + ">" + icon(item.icon) + "<span>" + escapeHtml(item.label) + "</span>" + (item.children ? icon(open ? "fa-chevron-up" : "fa-chevron-down") : "") + "</button>" + subnav + "</div>";
          }).join("") + '</nav><button class="ops-sidebar-footer" type="button" data-action="collapse-note">' + icon("fa-angles-left") + "<span>收起菜单</span></button></aside>";
        }
        function renderPageTabs(route) {
          if (route === "home") return '<nav class="ops-tabs" aria-label="已打开页面"><div class="ops-tab is-active"><button class="ops-tab-label" type="button">首页</button></div></nav>';
          return '<nav class="ops-tabs" aria-label="已打开页面"><div class="ops-tab"><button class="ops-tab-label" type="button" data-route="home">首页</button></div><div class="ops-tab is-active"><button class="ops-tab-label" type="button">' + escapeHtml(ROUTES[route].label) + '</button><button type="button" aria-label="关闭' + escapeHtml(ROUTES[route].label) + '" data-route="home">' + icon("fa-xmark") + "</button></div></nav>";
        }
        function renderIconActions(primaryText, primaryAction, primaryIcon) {
          var resolvedPrimaryIcon = typeof primaryIcon === "undefined" ? "fa-circle-plus" : primaryIcon;
          return '<button class="ops-icon-button" type="button" aria-label="搜索" title="搜索" data-action="focus-search">' + icon("fa-magnifying-glass") + '</button><button class="ops-icon-button" type="button" aria-label="筛选" title="筛选" data-action="focus-search">' + icon("fa-filter") + '</button><button class="ops-icon-button" type="button" aria-label="列表设置" title="列表设置" data-action="settings">' + icon("fa-gear") + "</button>" + (primaryText ? button(primaryText, "primary", primaryAction, "", resolvedPrimaryIcon) : "");
        }
        function renderMaterialTabs() {
          return '<div class="ops-tabs-line" role="tablist" aria-label="素材范围">' + ["个人素材", "租户素材"].map(function (tab) {
            return '<button type="button" role="tab" aria-selected="' + (state.materialTab === tab ? "true" : "false") + '" class="' + (state.materialTab === tab ? "is-active" : "") + '" data-action="material-tab" data-value="' + tab + '">' + (tab === "租户素材" ? "公共素材" : tab) + "</button>";
          }).join("") + "</div>";
        }
        function materialGroups() {
          var rows = materials[state.materialTab];
          var order = state.materialGroupOrder[state.materialTab] || [];
          return [["全部素材", rows.length]].concat(order.map(function (name) {
            return [name, rows.filter(function (item) { return item.group === name; }).length];
          }));
        }
        function materialTypeCount(type) {
          return materials[state.materialTab].filter(function (item) {
            var groupMatch = state.materialGroup === "全部素材" || item.group === state.materialGroup;
            return groupMatch && (type === "全部" || item.type === type);
          }).length;
        }
        function filteredMaterials() {
          return materials[state.materialTab].filter(function (item) {
            var typeMatch = state.materialType === "全部" || item.type === state.materialType;
            var groupMatch = state.materialGroup === "全部素材" || item.group === state.materialGroup;
            var queryMatch = !state.materialApplied || (item.name + item.group + item.summary).indexOf(state.materialApplied) >= 0;
            return typeMatch && groupMatch && queryMatch;
          });
        }
        function renderMaterialSummary(item) {
          var thumbnail = item.type === "小程序" ? (item.thumbnail || MATERIAL_WELCOME_IMAGE) : item.type === "图片" ? item.thumbnail : "";
          var visual = thumbnail
            ? '<img class="ops-material-summary-image' + (item.type === "小程序" ? ' is-mini' : '') + '" src="' + escapeHtml(thumbnail === "assets/welcome-health-service.png" ? MATERIAL_WELCOME_IMAGE : thumbnail) + '" alt="' + escapeHtml(item.name) + '">'
            : '<span class="ops-material-summary-icon">' + icon(TYPE_ICONS[item.type] || "fa-file") + '</span>';
          var title = item.type === "网页" ? item.name : item.summary;
          var detail = item.type === "网页" ? item.content : item.metadata;
          return '<div class="ops-material-summary">' + visual + '<div class="ops-material-summary-copy"><span' + (item.type === "文本" ? ' class="ops-cell-summary"' : '') + '>' + escapeHtml(title) + '</span>' + (detail ? '<small>' + escapeHtml(detail) + '</small>' : '') + '</div></div>';
        }
        function renderMaterialRows() {
          var rows = filteredMaterials();
          var personal = state.materialTab === "个人素材";
          if (!rows.length) return '<tr><td colspan="7"><div class="ops-empty">暂无符合条件的素材</div></td></tr>';
          return rows.map(function (item) {
            var operations = "";
            if (personal) {
              operations = '<td><div class="ops-row-actions"><button class="ops-link" type="button" data-action="material-edit" data-id="' + item.id + '">编辑</button><button class="ops-link" type="button" data-action="material-pin" data-id="' + item.id + '">' + (item.pinned ? "取消置顶" : "置顶") + '</button><button class="ops-link ops-link-danger" type="button" data-action="material-delete" data-id="' + item.id + '">删除</button></div></td>';
            } else {
              operations = '<td><button class="ops-link" type="button" data-action="material-detail" data-id="' + item.id + '">查看详情</button></td>';
            }
            return '<tr><td class="ops-cell-strong">' + escapeHtml(item.name) + (item.pinned ? ' <span class="ops-tag is-red">置顶</span>' : "") + '</td><td>' + escapeHtml(item.group) + '</td><td>' + renderMaterialSummary(item) + '</td><td>' + escapeHtml(item.type) + '</td><td>' + escapeHtml(item.purpose) + '</td><td>' + escapeHtml(item.updated) + '</td>' + operations + "</tr>";
          }).join("");
        }
        function renderMaterialsPage() {
          var groups = materialGroups();
          var personal = state.materialTab === "个人素材";
          var typeButtons = ["全部", "文本", "图片", "网页", "视频", "语音", "文件", "小程序"].map(function (type) {
            return '<button type="button" class="' + (state.materialType === type ? "is-active" : "") + '" data-action="material-type" data-value="' + type + '">' + type + '<span class="ops-type-count">' + materialTypeCount(type) + "</span></button>";
          }).join("");
          var groupRows = groups.map(function (group, index) {
            var name = group[0];
            var isAll = index === 0;
            var rowClass = "ops-group-row" + (state.materialGroup === name ? " is-active" : "") + (isAll ? " is-all" : "");
            return '<div class="' + rowClass + '" data-material-group-row="' + escapeHtml(name) + '"><button class="ops-group-select" type="button" data-action="material-group" data-value="' + escapeHtml(name) + '" aria-pressed="' + (state.materialGroup === name ? "true" : "false") + '">' + escapeHtml(name) + "（" + group[1] + '）</button>' + (isAll ? "" : '<button class="ops-group-drag" type="button" draggable="true" data-material-group-drag="' + escapeHtml(name) + '" aria-label="拖动' + escapeHtml(name) + '调整排序" title="拖动调整排序">' + icon("fa-grip-lines") + "</button>") + "</div>";
          }).join("");
          var groupPanel = '<section class="ops-card ops-group-panel"><h3>素材分组</h3><div class="ops-group-list">' + groupRows + '</div><div class="ops-group-panel-footer">' + button("管理分组", "", "group-settings") + "</div></section>";
          var query = '<div class="ops-material-query"><label class="ops-search-shell">' + icon("fa-magnifying-glass") + '<input id="ops-material-search" data-bind="material.search" value="' + escapeHtml(state.materialSearch) + '" placeholder="请输入素材名称" aria-label="素材名称"></label><div class="ops-material-search">' + button("重置", "", "material-reset") + button("查询", "primary", "material-search") + "</div></div>";
          var operationHead = "<th>操作</th>";
          var tableMinWidth = personal ? "1120px" : "1040px";
          var table = '<section class="ops-card ops-table-panel ops-material-table-panel"><div class="ops-table-scroll"><table class="ops-table ops-material-table" style="min-width:' + tableMinWidth + '" aria-label="素材列表"><thead><tr><th>素材名称</th><th>分组</th><th>素材摘要</th><th>素材类型</th><th>用途</th><th>更新时间</th>' + operationHead + '</tr></thead><tbody>' + renderMaterialRows() + "</tbody></table></div></section>";
          var content = '<div class="ops-material-layout">' + groupPanel + '<section class="ops-material-main"><div class="ops-type-filter">' + typeButtons + "</div>" + query + table + "</section></div>";
          var pagination = '<footer class="ops-pagination ops-material-pagination"><span>共 ' + filteredMaterials().length + ' 条数据</span>' + button("上一页", "", "noop", "disabled") + '<button class="ops-page-number" type="button" aria-current="page">1</button>' + button("下一页", "", "noop", "disabled") + '<select aria-label="每页条数"><option>15 条/页</option></select><label class="ops-pagination-jump"><span>跳至</span><input inputmode="numeric" aria-label="跳转页码"><span>页</span></label></footer>';
          return '<section class="ops-page ops-list-page">' + toolbar(["首页", "运营管理", "素材管理"], renderIconActions("新增素材", "material-new")) + renderMaterialTabs() + content + pagination + "</section>";
        }
        function materialCountedControl(key, placeholder, limit, multiline) {
          var value = state.materialDraft[key] || "";
          var attributes = ' data-bind="material.' + key + '" placeholder="' + escapeHtml(placeholder) + '" maxlength="' + limit + '" aria-describedby="ops-material-count-' + key + '"';
          var control = multiline ? '<textarea' + attributes + '>' + escapeHtml(value) + '</textarea>' : '<input' + attributes + ' value="' + escapeHtml(value) + '">';
          return '<span class="ops-material-counted-control' + (multiline ? ' is-textarea' : '') + '">' + control + '<span class="ops-material-char-count" id="ops-material-count-' + key + '">' + value.length + '/' + limit + '</span></span>';
        }
        // 动参唯一数据源：新增/下线动参只改这里，插入菜单、文本标签、各处提示文案自动联动。
        var MATERIAL_PARAMETERS = [
          { token: "{{doctor_name}}", label: "医生姓名", short: "医生姓名" },
          { token: "{{patient_name}}", label: "患者姓名", short: "患者姓名" },
          { token: "{{gender}}", label: "先生/女士", short: "先生/女士" },
          { token: "{{pid}}", label: "患者 ID（pid）", short: "pid" },
          { token: "{{doctor_id}}", label: "医生 ID", short: "医生 ID" }
        ];
        var materialTokenPatternCache = null;
        function materialTokenPattern() {
          if (!materialTokenPatternCache) {
            materialTokenPatternCache = new RegExp("(" + MATERIAL_PARAMETERS.map(function (item) { return item.token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }).join("|") + ")", "g");
          }
          return materialTokenPatternCache;
        }
        function materialParameterByToken(token) {
          for (var i = 0; i < MATERIAL_PARAMETERS.length; i++) { if (MATERIAL_PARAMETERS[i].token === token) return MATERIAL_PARAMETERS[i]; }
          return null;
        }
        function materialTokenHintText() {
          return MATERIAL_PARAMETERS.map(function (item) { return "【" + item.short + "】"; }).join("");
        }
        function materialHelpMarkup(options) {
          var markup = '<span class="ops-material-help-line">现在仅支持动态拼接：<span class="ops-material-help-tokens">' + materialTokenHintText() + "</span></span>";
          if (options && options.example) markup += '<span class="ops-material-help-line">拼接示例：<code class="ops-material-help-example">' + escapeHtml(options.example) + "</code></span>";
          if (options && options.note) markup += '<span class="ops-material-help-note">' + escapeHtml(options.note) + "</span>";
          return markup;
        }
        function materialLinkHelp(kind) {
          if (kind === "mini") return { markup: materialHelpMarkup({ example: "pages/health/index?doctor=【医生姓名】&pid=【pid】", note: "页面路径无需以斜杠开头，如 pages/health/index。" }), label: "查看小程序路径动参说明" };
          return { markup: materialHelpMarkup({ example: "https://example.com/health?name=【患者姓名】&pid=【pid】", note: "链接需以 http:// 或 https:// 开头，保存前会校验格式。" }), label: "查看网页链接动参说明" };
        }
        function materialParameterControl() {
          var items = MATERIAL_PARAMETERS.map(function (item) {
            return '<button type="button" class="ops-material-parameter" data-action="material-param-insert" data-value="' + item.token + '"><strong>' + item.label + '</strong><code>' + item.token + '</code></button>';
          }).join("");
          return '<div class="ops-material-parameters" aria-label="插入动参"><button type="button" class="ops-material-parameter-trigger" data-action="material-param-toggle" aria-expanded="false" aria-haspopup="dialog" aria-controls="ops-material-parameter-menu">插入动参' + icon("fa-chevron-down") + '</button><div class="ops-material-parameter-menu" id="ops-material-parameter-menu" role="dialog" aria-label="插入动参" hidden><div class="ops-material-parameter-heading"><strong>插入动参</strong><button type="button" data-action="material-param-close" aria-label="关闭动参">' + icon('fa-xmark') + '</button></div><div class="ops-material-parameter-options">' + items + '</div></div></div>';
        }
        function materialHelpIcon(markup, id, label) {
          return '<span class="ops-material-help"><button type="button" class="ops-material-help-trigger" data-action="material-help-toggle" aria-expanded="false" aria-describedby="' + id + '" aria-label="' + escapeHtml(label || "查看说明") + '">' + icon("fa-circle-question") + '</button><span class="ops-material-help-popover" id="' + id + '" role="tooltip" hidden>' + markup + '</span></span>';
        }
        function closeMaterialHelpPopovers() {
          document.querySelectorAll(".ops-material-help-popover").forEach(function (item) { item.hidden = true; });
          document.querySelectorAll(".ops-material-help-trigger").forEach(function (item) { item.setAttribute("aria-expanded", "false"); });
          document.querySelectorAll(".ops-material-parameter-menu").forEach(function (item) { item.hidden = true; });
          document.querySelectorAll('[data-action="material-param-toggle"]').forEach(function (item) { item.setAttribute("aria-expanded", "false"); item.classList.remove("is-open"); });
        }
        function positionMaterialFloating(trigger, panel, alignRight) {
          panel.hidden = false;
          var anchor = trigger.getBoundingClientRect();
          var viewport = window.visualViewport;
          var viewportTop = viewport ? viewport.offsetTop : 0;
          var viewportLeft = viewport ? viewport.offsetLeft : 0;
          var viewportWidth = viewport ? viewport.width : window.innerWidth;
          var viewportHeight = viewport ? viewport.height : window.innerHeight;
          var edge = 12, gap = 6;
          var below = Math.max(0, viewportTop + viewportHeight - edge - anchor.bottom - gap);
          var above = Math.max(0, anchor.top - viewportTop - edge - gap);
          panel.style.maxHeight = Math.max(0, Math.max(below, above)) + 'px';
          var width = panel.offsetWidth || 280, height = panel.offsetHeight || 0;
          var left = alignRight ? anchor.right - width : anchor.left;
          left = Math.max(viewportLeft + edge, Math.min(left, viewportLeft + viewportWidth - width - edge));
          var top = below >= height || below >= above ? anchor.bottom + gap : anchor.top - height - gap;
          top = Math.max(viewportTop + edge, Math.min(top, viewportTop + viewportHeight - height - edge));
          panel.style.left = Math.round(left) + "px";
          panel.style.top = Math.round(top) + "px";
        }
        function positionMaterialHelpPopover(trigger, popover) {
          popover.hidden = false;
          var anchor = trigger.getBoundingClientRect();
          var width = popover.offsetWidth || 272, height = popover.offsetHeight || 0;
          var center = anchor.left + anchor.width / 2;
          var left = Math.max(12, Math.min(center - width / 2, window.innerWidth - width - 12));
          var top = anchor.bottom + 8;
          if (top + height > window.innerHeight - 12) top = Math.max(12, anchor.top - height - 8);
          popover.style.left = Math.round(left) + "px";
          popover.style.top = Math.round(top) + "px";
          popover.style.setProperty("--ops-help-arrow-x", Math.round(center - left) + "px");
        }
        var materialHelpDismissBound = false;
        function updateMaterialFloating(event) {
          // A picker can scroll independently without being dismissed.
          if (event && event.target.closest && event.target.closest('.ops-material-parameter-menu')) return;
          document.querySelectorAll('.ops-material-help-popover').forEach(function (item) { item.hidden = true; });
          document.querySelectorAll('.ops-material-help-trigger').forEach(function (item) { item.setAttribute('aria-expanded', 'false'); });
          var menu = shell && shell.querySelector('#ops-material-parameter-menu:not([hidden])');
          var trigger = shell && shell.querySelector('[data-action="material-param-toggle"]');
          if (!menu || !trigger) return;
          var anchor = trigger.getBoundingClientRect();
          var scroller = trigger.closest('.ops-modal-body,.ops-page-scroll');
          var bounds = scroller ? scroller.getBoundingClientRect() : {top: 0, bottom: window.innerHeight};
          if (anchor.bottom <= Math.max(0, bounds.top) || anchor.top >= Math.min(window.innerHeight, bounds.bottom)) {
            closeMaterialHelpPopovers();
          } else positionMaterialFloating(trigger, menu, false);
        }
        function bindMaterialHelpDismiss() {
          if (materialHelpDismissBound) return;
          materialHelpDismissBound = true;
          document.addEventListener("scroll", updateMaterialFloating, true);
          window.addEventListener("resize", updateMaterialFloating);
          if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', updateMaterialFloating);
            window.visualViewport.addEventListener('scroll', updateMaterialFloating);
          }
          document.addEventListener("click", function (event) {
            if (event.target.closest && (event.target.closest(".ops-material-help") || event.target.closest('.ops-material-parameter-menu') || event.target.closest('[data-action="material-param-toggle"]'))) return;
            closeMaterialHelpPopovers();
          }, true);
        }
        function materialRichTextMarkup(value) {
          return String(value || "").split(materialTokenPattern()).map(function (part) {
            var parameter = materialParameterByToken(part);
            if (parameter) return '<span class="ops-material-token" contenteditable="false" data-material-token="' + parameter.token + '">' + parameter.label + '</span>';
            return escapeHtml(part).replace(/\n/g, "<br>");
          }).join("");
        }
        function materialRichTextValue(editor) {
          var clone = editor.cloneNode(true);
          clone.querySelectorAll("[data-material-token]").forEach(function (token) { token.replaceWith(document.createTextNode(token.getAttribute("data-material-token") || "")); });
          return (clone.innerText || clone.textContent || "").replace(/\u00a0/g, " ");
        }
        function materialRichTextValueFromRange(range) {
          var wrapper = document.createElement("div");
          wrapper.appendChild(range.cloneContents());
          return materialRichTextValue(wrapper);
        }
        function materialRichTextControl(value, limit) {
          return '<div class="ops-material-rich-control"><div class="ops-material-rich-editor" contenteditable="true" role="textbox" aria-label="素材内容" aria-multiline="true" data-material-rich-text data-placeholder="请输入文本话术">' + materialRichTextMarkup(value) + '</div><textarea hidden data-bind="material.text" maxlength="' + limit + '">' + escapeHtml(value || "") + '</textarea><span class="ops-material-char-count" id="ops-material-count-text">' + String(value || "").length + '/' + limit + '</span></div>';
        }
        function materialUploadSpec(slot) {
          var image = {extensions:["jpg","jpeg","png"], accept:".jpg,.jpeg,.png", max:10, hint:"支持 JPG、PNG 格式，最大 10MB"};
          if (slot !== "upload" || state.materialDraft.type === "图片") return image;
          if (state.materialDraft.type === "视频") return {extensions:["mp4"],accept:".mp4",max:200,hint:"支持 MP4 格式，最大 200MB"};
          if (state.materialDraft.type === "语音") return {extensions:["mp3","wav"],accept:".mp3,.wav",max:20,hint:"支持 MP3、WAV 格式，最大 20MB"};
          return {extensions:["doc","docx","xls","xlsx","pdf"],accept:".doc,.docx,.xls,.xlsx,.pdf",max:50,hint:"支持 Word、Excel、PDF 格式，单个文件不超过 50MB"};
        }
        var materialObjectUrls = [];
        window.addEventListener("beforeunload",function(){materialObjectUrls.forEach(function(url){URL.revokeObjectURL(url);});});
        function acceptMaterialFile(slot, files) {
          if (!files || files.length !== 1) {toast("请选择一个文件");return;}
          var file=files[0], spec=materialUploadSpec(slot), ext=file.name.split(".").pop().toLowerCase();
          if (spec.extensions.indexOf(ext)<0) {toast("文件格式不支持，"+spec.hint);return;}
          if (!file.size || file.size>spec.max*1024*1024) {toast("文件不能为空，且不能超过 "+spec.max+"MB");return;}
          if (typeof URL.createObjectURL!=="function") {toast("当前环境无法读取本地文件");return;}
          var url=URL.createObjectURL(file);materialObjectUrls.push(url);
          state.materialDraft[slot+"Name"]=file.name;
          state.materialDraft[slot+"Url"]=url;
          state.materialDraft[slot+"Size"]=file.size;
          render();
        }
        function materialUploadField(slot,label,required) {
          var draft=state.materialDraft,spec=materialUploadSpec(slot), name=draft[slot+"Name"],url=draft[slot+"Url"];
          var preview=url && spec.extensions.indexOf("png")>=0 ? '<img class="ops-material-upload-preview" src="'+escapeHtml(url)+'" alt="'+escapeHtml(label)+'预览">' : icon(TYPE_ICONS[draft.type]||"fa-image");
          return '<div class="ops-field"><span class="ops-field-label">'+(required?'<span class="ops-required">*</span>':'')+label+'</span><div data-material-drop="'+slot+'"><button class="ops-upload" type="button" data-action="material-file-pick" data-slot="'+slot+'" aria-label="选择'+label+'">'+preview+'<strong>'+escapeHtml(name||"点击上传 / 拖拽到此区域")+'</strong></button><input type="file" hidden data-material-file="'+slot+'" accept="'+spec.accept+'"></div><small class="ops-field-hint">'+spec.hint+(slot==="miniImage"?'，建议尺寸 520 × 416 px，宽高比 5:4':'')+'</small></div>';
        }
        function renderMaterialTypeContent() {
          var draft=state.materialDraft;
          if (draft.type === "文本") { return '<div class="ops-field"><span class="ops-field-label"><span class="ops-required">*</span>素材内容</span>'+materialRichTextControl(draft.text,200)+materialParameterControl()+'</div>'; }
          function field(key,label,required,placeholder,help) {return '<label class="ops-field"><span class="ops-field-label">'+(required?'<span class="ops-required">*</span>':'')+label+(help?materialHelpIcon(help.markup,help.id||('ops-material-help-'+key),help.label):'')+'</span><input data-bind="material.'+key+'" value="'+escapeHtml(draft[key]||'')+'" placeholder="'+escapeHtml(placeholder||'请输入'+label)+'"></label>';}
          if (draft.type === "网页") return '<div class="ops-form-grid">'+field("webTitle","网页标题",true)+field("webUrl","网页链接",true,"请输入网页链接",materialLinkHelp("web"))+materialUploadField("webCover","封面图",false)+'<label class="ops-field ops-full-span"><span class="ops-field-label">网页描述</span>'+materialCountedControl("webDescription","请输入网页描述",200,true)+'</label></div>';
          if (draft.type === "小程序") return '<div class="ops-form-grid">'+field("miniTitle","小程序标题",true)+field("appId","AppID",true)+field("path","页面路径",true,"请输入页面路径",materialLinkHelp("mini"))+field("originalId","原始 ID",true,"请输入小程序原始 ID（gh_ 开头）")+'<label class="ops-field ops-full-span"><span class="ops-field-label"><span class="ops-required">*</span>描述</span>'+materialCountedControl("miniDescription","请输入小程序描述",200,true)+'</label>'+materialUploadField("miniIcon","Icon 图标",true)+materialUploadField("miniImage","上传图片",true)+'</div>';
          return materialUploadField("upload","素材内容",true);
        }
        function saveMaterialDraft() {
          var draft=state.materialDraft, type=draft.type;
          if(state.modal && state.modal.type === "chat-material-create" && (state.chatMaterialScope !== "个人素材" || draft.scope !== "个人素材")) return;
          function required(key,message){if(!String(draft[key]||'').trim()){toast(message);return false;}return true;}
          if(!required('title','请输入素材名称'))return;
          if(!draft.purposes.length){toast('请至少选择一种用途');return;}
          if(type==='文本'&&!required('text','请输入素材内容'))return;
          if(type==='网页'){
            if(!required('webTitle','请输入网页标题')||!required('webUrl','请输入网页链接'))return;
            try{var link=new URL(draft.webUrl);if(!/^https?:$/.test(link.protocol))throw new Error();}catch(error){toast('请输入有效的 HTTP 或 HTTPS 网页链接');return;}
          }
          if(type==='小程序'){
            var requiredFields={miniTitle:'请输入小程序标题',appId:'请输入 AppID',path:'请输入页面路径',originalId:'请输入小程序原始 ID',miniDescription:'请输入小程序描述',miniIconName:'请选择小程序图标',miniImageName:'请选择小程序图片'};
            var keys=Object.keys(requiredFields);for(var i=0;i<keys.length;i++){if(!required(keys[i],requiredFields[keys[i]]))return;}
            if(!/^gh_\S+$/.test(draft.originalId.trim())){toast('小程序原始 ID 需以 gh_ 开头');return;}
          }
          if(['图片','视频','语音','文件'].indexOf(type)>=0&&!required('uploadName','请选择素材文件'))return;
          if((type==='文本'&&draft.text.length>200)||(type==='网页'&&(draft.webDescription||'').length>200)||(type==='小程序'&&(draft.miniDescription||'').length>200)){toast('内容不能超过 200 字');return;}
          var scope=draft.scope;
          var editingPreview=state.modal && state.modal.type==="chat-material-create" && state.modal.editId;
          if(editingPreview && (state.materialMode!=="edit" || !state.selectedMaterial || state.selectedMaterial.id!==editingPreview || !(materials["个人素材"]||[]).includes(state.selectedMaterial)))return;
          if(draft.group&&(state.materialGroupOrder[scope]||[]).indexOf(draft.group)<0){toast('请选择有效的素材分组');return;}
          var item=state.materialMode==='edit'?state.selectedMaterial:null;
          if(!item){item={id:'material-'+Date.now()+'-'+(++materialSequence),pinned:false};materials[scope].unshift(item);}
          var oldMetadata=item.metadata, sameFile=item.type===type && (item.uploadName||item.content)===draft.uploadName && (item.uploadUrl||item.mediaUrl||item.thumbnail||'')===(draft.uploadUrl||'');
          item.name=draft.title.trim();item.group=draft.group||'未分组';item.type=type;item.purpose=draft.purposes.join(' / ');item.updated='刚刚';
          item.content=type==='文本'?draft.text.trim():type==='网页'?draft.webUrl.trim():type==='小程序'?draft.path.trim():draft.uploadName;
          item.summary=type==='文本'?item.content:type==='网页'?(draft.webDescription||draft.webTitle):type==='小程序'?draft.miniDescription:draft.uploadName;
          ['webTitle','webDescription','webCoverName','webCoverUrl','miniTitle','appId','path','originalId','miniDescription','miniIconName','miniIconUrl','miniImageName','miniImageUrl','uploadName','uploadUrl','uploadSize'].forEach(function(key){item[key]=draft[key]||'';});
          item.thumbnail=type==='图片'?draft.uploadUrl:type==='小程序'?draft.miniImageUrl:type==='网页'?draft.webCoverUrl:'';
          item.mediaUrl=['视频','语音','文件'].indexOf(type)>=0?draft.uploadUrl:'';
          item.metadata=draft.uploadSize&&['图片','视频','语音','文件'].indexOf(type)>=0?(draft.uploadName.split('.').pop().toUpperCase()+' · '+(draft.uploadSize/1024/1024).toFixed(2)+' MB'):'';
          if(sameFile && oldMetadata)item.metadata=oldMetadata;
          state.materialTab=scope;state.materialGroup='全部素材';state.materialType='全部';state.materialSearch='';state.materialApplied='';state.materialMode='create';
          if(state.modal&&state.modal.type==="chat-material-create") {
            state.modal=editingPreview?{type:"chat-material-preview",materialId:item.id,name:item.name,typeName:item.type,content:item.content}:null;state.chatMaterialScope=scope;
            state.chatMaterialSearch="";state.chatMaterialGroup="全部素材";state.chatMaterialType="全部类型";
            toast("素材已保存");
          } else {navigate('materials');window.setTimeout(function(){toast('素材已保存');},10);}
        }
        var materialSequence=0;
        function resetMaterialDraft() {
          state.materialMode="create";state.selectedMaterial=null;
          state.materialDraft={title:"",group:"",scope:"个人素材",purposes:["会话"],type:"文本",text:"",webTitle:"",webUrl:"",webDescription:"",miniTitle:"",appId:"",path:"",uploadName:""};
        }
        function renderMaterialEditorFields() {
          var draft = state.materialDraft;
          var types = ["文本", "图片", "网页", "视频", "语音", "文件", "小程序"].map(function (type) {
            return '<button class="ops-material-type ' + (draft.type === type ? "is-active" : "") + '" type="button" data-action="material-form-type" data-value="' + type + '" aria-pressed="' + (draft.type === type ? "true" : "false") + '">' + icon(TYPE_ICONS[type]) + "<span>" + type + "</span></button>";
          }).join("");
          var purpose = ["会话", "消息推送"].map(function (item) {
            var checked = draft.purposes.indexOf(item) >= 0;
            return '<label><input type="checkbox" data-purpose="' + item + '" ' + (checked ? "checked" : "") + ">" + item + "</label>";
          }).join("");
          var groupOptions = '<option value="">请选择素材分组</option>' + (state.materialGroupOrder[draft.scope] || []).map(function (group) {
            return '<option value="' + escapeHtml(group) + '"' + (draft.group === group ? " selected" : "") + '>' + escapeHtml(group) + "</option>";
          }).join("");
          var titleField = '<label class="ops-field"><span class="ops-field-label"><span class="ops-required">*</span>素材名称</span><input data-bind="material.title" data-initial-focus value="' + escapeHtml(draft.title) + '" placeholder="请输入素材名称"></label>';
          var groupField = '<div class="ops-field"><label class="ops-field-label" for="ops-material-group">素材分组</label><div class="ops-material-group-choice"><select id="ops-material-group" data-bind="material.group">' + groupOptions + '</select>'+button("分组管理","","material-form-new-group")+'</div></div>';
          var scopeChoices = state.modal && state.modal.type === "chat-material-create" ? ["个人素材"] : state.materialMode === "edit" ? [draft.scope] : ["个人素材","租户素材"];
          var scopeField = '<div class="ops-field"><span class="ops-field-label"><span class="ops-required">*</span>素材范围</span><div class="ops-choice-row">'+scopeChoices.map(function(scope){return '<label><input type="radio" name="material-scope" data-material-scope="'+scope+'" '+(draft.scope===scope?'checked':'')+'>'+escapeHtml(scope==="租户素材"?"公共素材":scope)+'</label>';}).join('')+'</div></div>';
          var purposeField = '<div class="ops-field"><span class="ops-field-label"><span class="ops-required">*</span>用途标记</span><div class="ops-choice-row">' + purpose + "</div></div>";
          var typeField = '<div class="ops-field"><span class="ops-field-label"><span class="ops-required">*</span>素材类型</span><div class="ops-material-types">' + types + "</div></div>";
          var formContent = state.materialMode === "create"
            ? '<div class="ops-material-create-grid">' + titleField + groupField + scopeField + purposeField + "</div>" + typeField + '<div class="ops-material-create-content">' + renderMaterialTypeContent() + "</div>"
            : '<div class="ops-material-create-grid">' + titleField + groupField + scopeField + purposeField + "</div>" + typeField + renderMaterialTypeContent();
          return formContent;
        }
        function renderMaterialFormPage() {
          var formContent=renderMaterialEditorFields();
          var body = '<div class="ops-page-scroll"><h1 class="ops-page-title">' + (state.materialMode === "edit" ? "编辑素材" : "新建素材") + '</h1><section class="ops-card ops-form-card ' + (state.materialMode === "create" ? "ops-material-create-card" : "") + '"><div class="ops-form-card-body">' + formContent + '</div><footer class="ops-form-footer">' + button("取消", "", "material-cancel") + button("确定", "primary", "material-save") + "</footer></section></div>";
          return '<section class="ops-page">' + toolbar(["首页", "运营管理", "素材管理", state.materialMode === "edit" ? "编辑素材" : "新建素材"], "") + body + "</section>";
        }
        function selectedMaterial() {
          if (state.selectedMaterial) return state.selectedMaterial;
          return materials["平台素材"][1];
        }
        function renderMaterialDetailPage() {
          var item = selectedMaterial();
          var content = item.type === "图片" ? '<img class="ops-material-image" src="' + escapeHtml(item.thumbnail || INFO_IMAGE) + '" alt="'+escapeHtml(item.name)+'">' : '<div class="ops-card" style="padding:16px;box-shadow:none">' + escapeHtml(item.content || item.summary) + "</div>";
          var generation = '<section class="ops-material-generation"><h2 style="margin:0;color:#173b5f;font-size:18px">患教素材生成与发布记录</h2><div class="ops-material-generation-grid"><div><span>生成入口</span><strong>主题：刘德华·家庭血压记录</strong></div><div><span>生成前状态</span><strong>待审核（主题与受众已填写）</strong></div><div><span>生成进度</span><strong>100% · 已生成预览</strong></div><div><span>生成后状态</span><strong>已人工审核 · 可发布</strong></div></div><div class="ops-safety-copy"><strong>审核结论：通过</strong><span>内容只做记录方法、轻微不适观察和就医入口提示，不替代医生判断，不给出诊断、治疗或购药结论。已加入“超出知识库”拒答与转人工提示。</span></div><div class="ops-inline-actions">' + button("修改内容", "", "material-generate-edit", "", "fa-pen") + button("预览患者端", "", "material-generate-preview", "", "fa-eye") + button("发布到患者端", "primary", "material-generate-publish", "", "fa-paper-plane") + '</div></section>';
          var body = '<div class="ops-page-scroll"><h1 class="ops-page-title">素材详情</h1><section class="ops-card ops-detail-card"><div class="ops-detail-section"><p class="ops-detail-label">素材名称</p><div class="ops-detail-value">' + escapeHtml(item.name) + '</div></div><div class="ops-detail-section ops-detail-split"><div><p class="ops-detail-label">素材范围</p><span class="ops-tag">' + escapeHtml(state.materialTab) + '</span></div><div><p class="ops-detail-label">用途标记</p><div class="ops-inline-actions">' + (item.purpose.indexOf("会话") >= 0 ? '<span class="ops-tag">可用于会话：是</span>' : '<span class="ops-tag is-gray">可用于会话：否</span>') + (item.purpose.indexOf("推送") >= 0 ? '<span class="ops-tag">可用于消息推送：是</span>' : '<span class="ops-tag is-gray">可用于消息推送：否</span>') + '</div></div></div><div class="ops-detail-section"><p class="ops-detail-label">素材类型</p><div class="ops-type-display"><span class="ops-type-icon">' + icon(TYPE_ICONS[item.type] || "fa-file") + "</span><span>" + escapeHtml(item.type) + '</span></div></div><div class="ops-detail-section"><p class="ops-detail-label">素材内容</p>' + content + '</div><div class="ops-detail-meta"><span>所属分组：' + escapeHtml(item.group) + '</span><span>创建时间：2026-08-04 10:20:00</span><span>更新时间：' + escapeHtml(item.updated) + '</span></div><footer class="ops-form-footer" style="margin:0 -24px">' + button("关闭", "", "material-cancel") + "</footer></section></div>";
          body = body.replace(/<\/div>$/, generation + "</div>");
          return '<section class="ops-page">' + toolbar(["首页", "运营管理", "素材管理", "素材详情"], "") + body + "</section>";
        }
        var messageTasks = [
          { id: "msg-001", name: "糖尿病饮食宣教", content: "请查阅糖尿病饮食指南", audience: "诊断：2型糖尿病", target: 12, success: null, failed: null, sendType: "立即", status: "进行中", sentAt: "2026-08-01 10:30:00", createdAt: "2026-08-01 10:00:00", creator: "张医生" },
          { id: "msg-002", name: "复诊提醒", content: "请按预约时间到院复诊", audience: "所属项目：慢病随访", target: 18, success: 15, failed: 3, sendType: "定时", status: "异常任务", sentAt: "2026-08-03 09:00:00", createdAt: "2026-08-02 16:20:00", creator: "李医生" },
          { id: "msg-003", name: "用药提醒", content: "请按医嘱规律服药", audience: "诊断：高血压", target: 9, success: null, failed: null, sendType: "定时", status: "待执行", sentAt: "2026-08-12 08:00:00", createdAt: "2026-08-06 14:18:00", creator: "王医生" },
          { id: "msg-004", name: "活动通知", content: "健康课堂活动时间调整", audience: "所属租户：A医院", target: 24, success: null, failed: null, sendType: "立即", status: "已取消", sentAt: "--", createdAt: "2026-08-05 11:40:00", creator: "运营一" },
          { id: "msg-005", name: "夏季防暑提醒", content: "高温天气请及时补水", audience: "标签：健康宣教", target: 36, success: 36, failed: 0, sendType: "立即", status: "已完成", sentAt: "2026-08-04 08:00:00", createdAt: "2026-08-04 07:45:00", creator: "运营二" }
        ];
        var followupRules = [
          { name: "连续3天晨间血压记录", trigger: "患者端连续提交3天", task: "记录确认", reply: "已收到您的记录，明天继续保持", status: "已启用" },
          { name: "复诊前7天提醒", trigger: "距离预约日期7天", task: "复诊准备", reply: "复诊前请整理近期记录", status: "已启用" },
          { name: "轻微头晕反馈", trigger: "问答命中轻微头晕", task: "人工复核", reply: "我先记录情况并转交医助", status: "已启用" },
          { name: "连续2天未记录", trigger: "超过48小时无记录", task: "关怀提醒", reply: "需要帮助时可随时告诉我", status: "已启用" },
          { name: "报告上传成功", trigger: "患者端新增报告", task: "报告确认", reply: "报告已收到，复诊时可供查看", status: "已启用" }
        ];
        for (var ruleIndex = 6; ruleIndex <= 20; ruleIndex += 1) {
          followupRules.push({ name: "患者随访规则" + ruleIndex, trigger: ruleIndex % 2 ? "患者端完成一次打卡" : "达到设定日期", task: ruleIndex % 3 ? "健康记录确认" : "人工复核", reply: "已记录，本次信息将同步到您的健康档案", status: ruleIndex === 20 ? "草稿" : "已启用" });
        }
        var patientArchives = [
          { id: "pa-1", name: "王德华", gender: "男", age: 58, phone: "138****5605", fullPhone: "13812345605", diagnosis: "2型糖尿病", project: "广德慢病项目", doctor: "张医生", scene: "慢病随访", tags: ["糖尿病", "血糖监测"], registered: "2026-08-01 10:20:00", updated: "2026-08-24 09:18:00" },
          { id: "pa-2", name: "孙大伟", gender: "男", age: 46, phone: "139****8821", fullPhone: "13924688821", diagnosis: "2型糖尿病", project: "广德慢病项目", doctor: "王医生", scene: "用药提醒", tags: ["糖尿病", "血糖监测"], registered: "2026-08-03 09:32:00", updated: "2026-08-23 16:40:00" },
          { id: "pa-3", name: "吴志强", gender: "男", age: 52, phone: "136****3201", fullPhone: "13623883201", diagnosis: "冠心病", project: "中山肿瘤随访", doctor: "李医生", scene: "健康宣教", tags: ["冠心病", "心血管"], registered: "2026-08-05 11:08:00", updated: "2026-08-22 08:56:00" },
          { id: "pa-4", name: "陈建军", gender: "男", age: 61, phone: "138****7712", fullPhone: "13835267712", diagnosis: "高血压", project: "广德慢病项目", doctor: "张医生", scene: "用药提醒", tags: ["高血压", "高血脂"], registered: "2026-08-06 14:30:00", updated: "2026-08-21 15:12:00" },
          { id: "pa-5", name: "许文龙", gender: "女", age: 49, phone: "137****6688", fullPhone: "13745886688", diagnosis: "2型糖尿病", project: "广德慢病项目", doctor: "王医生", scene: "慢病随访", tags: ["糖尿病", "饮食管理"], registered: "2026-08-07 08:46:00", updated: "2026-08-20 10:25:00" },
          { id: "pa-6", name: "赵强", gender: "男", age: 55, phone: "139****5566", fullPhone: "13956785566", diagnosis: "冠心病", project: "中山肿瘤随访", doctor: "李医生", scene: "健康宣教", tags: ["冠心病", "术后随访"], registered: "2026-08-08 13:10:00", updated: "2026-08-19 09:35:00" },
          { id: "pa-7", name: "林晓梅", gender: "女", age: 43, phone: "137****1048", fullPhone: "13745121048", diagnosis: "高血压", project: "广德慢病项目", doctor: "张医生", scene: "慢病随访", tags: ["高血压", "复诊提醒"], registered: "2026-08-09 10:18:00", updated: "2026-08-18 13:20:00" },
          { id: "pa-8", name: "周明远", gender: "男", age: 63, phone: "136****2890", fullPhone: "13678212890", diagnosis: "2型糖尿病", project: "广德慢病项目", doctor: "王医生", scene: "用药提醒", tags: ["糖尿病", "长期用药"], registered: "2026-08-10 16:05:00", updated: "2026-08-18 09:44:00" },
          { id: "pa-9", name: "唐婉宁", gender: "女", age: 37, phone: "158****3826", fullPhone: "15822933826", diagnosis: "甲状腺结节", project: "中山肿瘤随访", doctor: "李医生", scene: "健康宣教", tags: ["术后随访"], registered: "2026-08-11 09:12:00", updated: "2026-08-17 16:12:00" },
          { id: "pa-10", name: "何志勇", gender: "男", age: 50, phone: "139****0416", fullPhone: "13965090416", diagnosis: "高血脂", project: "广德慢病项目", doctor: "陈医生", scene: "慢病随访", tags: ["高血脂", "饮食管理"], registered: "2026-08-12 14:26:00", updated: "2026-08-17 11:03:00" },
          { id: "pa-11", name: "陈小雨", gender: "女", age: 29, phone: "186****7152", fullPhone: "18635717152", diagnosis: "肥胖", project: "广德慢病项目", doctor: "王医生", scene: "健康宣教", tags: ["饮食管理"], registered: "2026-08-13 12:44:00", updated: "2026-08-16 18:02:00" },
          { id: "pa-12", name: "郭海峰", gender: "男", age: 57, phone: "135****6370", fullPhone: "13548656370", diagnosis: "高血压", project: "广德慢病项目", doctor: "张医生", scene: "用药提醒", tags: ["高血压", "长期用药"], registered: "2026-08-14 08:55:00", updated: "2026-08-16 09:36:00" },
          { id: "pa-13", name: "赵婉君", gender: "女", age: 68, phone: "133****4902", fullPhone: "13367404902", diagnosis: "2型糖尿病", project: "广德慢病项目", doctor: "王医生", scene: "慢病随访", tags: ["糖尿病", "血糖监测"], registered: "2026-08-15 17:10:00", updated: "2026-08-15 19:01:00" },
          { id: "pa-14", name: "黄志成", gender: "男", age: 47, phone: "188****2284", fullPhone: "18892072284", diagnosis: "冠心病", project: "中山肿瘤随访", doctor: "李医生", scene: "健康宣教", tags: ["冠心病", "心血管"], registered: "2026-08-16 10:30:00", updated: "2026-08-15 16:22:00" },
          { id: "pa-15", name: "王芳", gender: "女", age: 54, phone: "138****9318", fullPhone: "13878129318", diagnosis: "高血压", project: "广德慢病项目", doctor: "陈医生", scene: "复诊提醒", tags: ["高血压", "复诊提醒"], registered: "2026-08-17 11:42:00", updated: "2026-08-15 14:15:00" },
          { id: "pa-16", name: "李建国", gender: "男", age: 60, phone: "139****5680", fullPhone: "13923525680", diagnosis: "高血脂", project: "广德慢病项目", doctor: "陈医生", scene: "健康宣教", tags: ["高血脂", "饮食管理"], registered: "2026-08-18 13:16:00", updated: "2026-08-14 12:08:00" },
          { id: "pa-17", name: "杨雪", gender: "女", age: 41, phone: "151****7764", fullPhone: "15166287764", diagnosis: "甲状腺结节", project: "中山肿瘤随访", doctor: "李医生", scene: "术后随访", tags: ["术后随访"], registered: "2026-08-19 15:38:00", updated: "2026-08-14 09:56:00" },
          { id: "pa-18", name: "罗勇", gender: "男", age: 45, phone: "137****3128", fullPhone: "13745023128", diagnosis: "肥胖", project: "广德慢病项目", doctor: "王医生", scene: "慢病随访", tags: ["饮食管理"], registered: "2026-08-20 09:06:00", updated: "2026-08-13 18:44:00" },
          { id: "pa-19", name: "沈洁", gender: "女", age: 33, phone: "159****0873", fullPhone: "15944070873", diagnosis: "高血压", project: "广德慢病项目", doctor: "张医生", scene: "用药提醒", tags: ["高血压", "长期用药"], registered: "2026-08-21 16:20:00", updated: "2026-08-13 10:25:00" },
          { id: "pa-20", name: "郑凯", gender: "男", age: 52, phone: "136****8421", fullPhone: "13657848421", diagnosis: "2型糖尿病", project: "广德慢病项目", doctor: "王医生", scene: "用药提醒", tags: ["糖尿病", "血糖监测"], registered: "2026-08-22 10:48:00", updated: "2026-08-12 15:40:00" }
        ];
        var patientMedicalTimeline = {
          "pa-1": {
            syncId: "PT-PA-0001",
            story: "王德华，58岁。病例时间轴共 7 条记录，包含脊柱检查、L3 椎体治疗、术后辅助化疗和近期复查资料。以下为合成演示数据，不代表真实医疗结论。",
            metrics: [{ label: "病例记录", value: "7 条" }, { label: "最近记录", value: "2026-10-21" }, { label: "报告解读", value: "4 条" }, { label: "原始文件", value: "11 份" }],
            events: [
              { date: "2026-10-21", createdAt: "2026-10-21 09:30:00", updatedAt: "2026-10-21 09:32:00", title: "复查报告示例", body: "报告原件已保存，您可以重新总结，或手动补充就诊信息。", source: "患者端·我的病历", kind: "病历总结", status: "处理失败", statusTone: "failed", summary: [{ label: "病历记录", value: "复查报告示例" }], report: "病历内容尚未生成，暂无可展示的解读内容。", originalCount: 1, files: [{ name: "复查报告示例.png", type: "图片" }] },
              { date: "2026-10-20", title: "腹腔镜膜十二指肠切除术", body: "腹腔镜膜十二指肠切除术。术后 6 次辅助化疗（FOLFOX，家属口述小剂量，具体未知）。", source: "患者/家属补充", kind: "治疗", status: "已完成", statusTone: "success", summary: [{ label: "病历内容", value: "腹腔镜膜十二指肠切除术；术后 6 次辅助化疗（FOLFOX）" }], originalCount: 3 },
              { date: "2026-10-19", title: "腰痛与体重变化", body: "打球扭到腰后，反复腰痛，2 月体重下降 10 斤。", source: "患者对话", kind: "病情评估", status: "已完成", statusTone: "success", summary: [{ label: "病情描述", value: "扭伤后反复腰痛，2 月体重下降 10 斤" }], report: "含报告解读", originalCount: 3 },
              { date: "2026-10-12", title: "复查资料上传", body: "复查资料已上传，等待医生查看。", source: "患者端·我的病历", kind: "复查", status: "已完成", statusTone: "success", summary: [{ label: "资料状态", value: "复查资料已上传，等待医生查看" }], originalCount: 1 },
              { date: "2026-09-28", title: "脊柱 MR 检查", body: "脊柱 MR：L3 椎旁肿块，L3/4 左侧神经根受压。", source: "患者端·我的病历", kind: "检查", status: "已完成", statusTone: "success", summary: [{ label: "检查结果", value: "脊柱 MR：L3 椎旁肿块，L3/4 左侧神经根受压" }], report: "含报告解读", originalCount: 1 },
              { date: "2026-09-28", title: "L3 椎体治疗", body: "经皮 L3 椎体活检+微波消融术。术前检验未见明显异常。", source: "患者端·我的病历", kind: "治疗", status: "已完成", statusTone: "success", summary: [{ label: "治疗记录", value: "经皮 L3 椎体活检+微波消融术；术前检验未见明显异常" }], report: "含报告解读", originalCount: 1 },
              { date: "2026-09-28", title: "术前检验与检查", body: "WBC 28.31↑，HGB 124↓，LDH 303↑。肺功能：中重度混合性通气障碍，弥散功能中度下降。心脏超声：EF 69%，结构功能正常。", source: "患者端·我的病历", kind: "检查、检验", status: "已完成", statusTone: "success", summary: [{ label: "检验结果", value: "WBC 28.31↑，HGB 124↓，LDH 303↑" }, { label: "检查结果", value: "肺功能中重度混合性通气障碍；心脏超声 EF 69%，结构功能正常" }], report: "含报告解读", originalCount: 1 }
            ]
          }
        };
        var patientFollowupRecords = {
          "pa-1": [
            { year: "2026 年（3 次）", date: "2026-08-24", planTag: "常规随访", status: "可编辑", type: "首次随访", title: "饮食与血糖记录随访", treatment: "自我管理记录", recorder: "患者本人 / 医生代录", note: "本次记录用于项目随访统计参考，复诊时由医生结合完整情况复核。" },
            { year: "2026 年（3 次）", date: "2026-08-10", planTag: "常规随访", status: "已提交", type: "首次随访", title: "用药与生活方式随访", treatment: "按项目计划记录", recorder: "患者本人", note: "已完成本次问卷，相关答案已写入患者病历时间轴。" },
            { year: "2026 年（3 次）", date: "2026-08-01", planTag: "建档随访", status: "已提交", type: "建档随访", title: "入组基线随访", treatment: "基础信息采集", recorder: "患者本人 / 医生代录", note: "入组资料来自合成演示数据，仅用于验证随访表单交互。" }
          ]
        };
        var patientArchiveTagOptions = [
          { name: "高血压", level1: "慢病管理", level2: "疾病标签", tagType: "平台标签" },
          { name: "糖尿病", level1: "慢病管理", level2: "疾病标签", tagType: "平台标签" },
          { name: "冠心病", level1: "慢病管理", level2: "疾病标签", tagType: "平台标签" },
          { name: "高血脂", level1: "慢病管理", level2: "疾病标签", tagType: "平台标签" },
          { name: "长期用药", level1: "患者分层", level2: "用药管理", tagType: "租户标签" },
          { name: "血糖监测", level1: "指标管理", level2: "监测计划", tagType: "租户标签" },
          { name: "饮食管理", level1: "健康管理", level2: "生活方式", tagType: "租户标签" },
          { name: "术后随访", level1: "随访管理", level2: "随访阶段", tagType: "租户标签" },
          { name: "心血管", level1: "我的患者", level2: "重点关注", tagType: "个人标签" }
        ];
        var opsPatients = [
          { id: "op-1", name: "--", gender: "--", phone: "135****6140", diagnosis: "--", hospital: "263医院", doctor: "患管项目助手", project: "糖脂减重项目", scene: "糖脂减重工作流（测试）", archived: false, medical: false, registered: "2026-08-31 13:56:39", login: "2026-08-31 14:58:22" },
          { id: "op-2", name: "阿珂", gender: "女", phone: "150****7438", diagnosis: "--", hospital: "263医院", doctor: "患管项目助手", project: "糖脂减重项目", scene: "中山一南沙院区300问诊", archived: true, medical: false, registered: "2026-08-20 09:42:10", login: "2026-09-09 10:20:08" },
          { id: "op-3", name: "周伟辉", gender: "男", phone: "131****9681", diagnosis: "--", hospital: "263医院", doctor: "患管项目助手", project: "糖脂减重项目", scene: "糖脂减重工作流（测试）", archived: true, medical: false, registered: "2026-08-13 22:05:16", login: "2026-09-08 08:31:45" },
          { id: "op-4", name: "陈静萍", gender: "女", phone: "186****4430", diagnosis: "--", hospital: "263医院", doctor: "患管项目助手", project: "慢病随访项目", scene: "糖脂减重工作流（测试）", archived: true, medical: false, registered: "2026-08-09 12:20:31", login: "2026-09-07 16:42:09" },
          { id: "op-5", name: "唐嘉荣", gender: "男", phone: "135****7226", diagnosis: "--", hospital: "263医院", doctor: "患管项目助手", project: "糖脂减重项目", scene: "糖脂减重工作流（测试）", archived: true, medical: false, registered: "2026-08-08 15:28:42", login: "2026-09-06 11:50:36" },
          { id: "op-6", name: "隆菲", gender: "女", phone: "159****6689", diagnosis: "--", hospital: "263医院", doctor: "患管项目助手", project: "糖脂减重项目", scene: "糖脂减重工作流（测试）", archived: true, medical: false, registered: "2026-08-08 09:35:12", login: "2026-09-05 09:18:24" },
          { id: "op-7", name: "雷海燕", gender: "女", phone: "138****8258", diagnosis: "肥胖", hospital: "263医院", doctor: "患管项目助手", project: "糖脂减重项目", scene: "糖脂减重工作流（测试）", archived: true, medical: false, registered: "2026-08-07 18:02:44", login: "2026-09-03 20:06:11" },
          { id: "op-8", name: "柯小源", gender: "男", phone: "183****6955", diagnosis: "高血压", hospital: "263医院", doctor: "患管项目助手", project: "慢病随访项目", scene: "糖脂减重工作流（测试）", archived: true, medical: false, registered: "2026-08-06 18:05:37", login: "2026-09-02 08:12:53" },
          { id: "op-9", name: "陆莹", gender: "女", phone: "138****6632", diagnosis: "--", hospital: "263医院", doctor: "患管项目助手", project: "糖脂减重项目", scene: "糖脂减重工作流（测试）", archived: true, medical: false, registered: "2026-08-05 20:50:04", login: "2026-09-01 14:28:40" },
          { id: "op-10", name: "张银屏", gender: "女", phone: "136****1979", diagnosis: "--", hospital: "263医院", doctor: "患管项目助手", project: "糖脂减重项目", scene: "糖脂减重工作流（测试）", archived: true, medical: false, registered: "2026-08-05 19:38:10", login: "2026-08-31 21:11:09" },
          { id: "op-11", name: "--", gender: "--", phone: "188****3274", diagnosis: "--", hospital: "263医院", doctor: "患管项目助手", project: "糖脂减重项目", scene: "糖脂减重工作流（测试）", archived: false, medical: false, registered: "2026-08-05 18:50:17", login: "2026-08-30 10:04:28" },
          { id: "op-12", name: "罗嘉琪", gender: "女", phone: "181****5270", diagnosis: "--", hospital: "263医院", doctor: "患管项目助手", project: "慢病随访项目", scene: "糖脂减重工作流（测试）", archived: true, medical: true, registered: "2026-08-05 17:42:53", login: "2026-08-29 16:35:02" },
          { id: "op-13", name: "--", gender: "--", phone: "131****5114", diagnosis: "--", hospital: "263医院", doctor: "患管项目助手", project: "糖脂减重项目", scene: "糖脂减重工作流（测试）", archived: false, medical: false, registered: "2026-08-05 13:08:22", login: "2026-08-28 19:44:36" },
          { id: "op-14", name: "王德华", gender: "男", phone: "138****5605", diagnosis: "2型糖尿病", hospital: "广德人民医院", doctor: "张医生", project: "广德慢病项目", scene: "慢病随访", archived: true, medical: true, registered: "2026-08-01 10:20:00", login: "2026-08-24 09:18:00", archiveId: "pa-1" },
          { id: "op-15", name: "孙大伟", gender: "男", phone: "139****8821", diagnosis: "2型糖尿病", hospital: "广德人民医院", doctor: "王医生", project: "广德慢病项目", scene: "用药提醒", archived: true, medical: true, registered: "2026-08-03 09:32:00", login: "2026-08-23 16:40:00", archiveId: "pa-2" },
          { id: "op-16", name: "吴志强", gender: "男", phone: "136****3201", diagnosis: "冠心病", hospital: "中山医院", doctor: "李医生", project: "中山肿瘤随访", scene: "健康宣教", archived: true, medical: true, registered: "2026-08-05 11:08:00", login: "2026-08-22 08:56:00", archiveId: "pa-3" },
          { id: "op-17", name: "林晓梅", gender: "女", phone: "137****1048", diagnosis: "高血压", hospital: "广德人民医院", doctor: "张医生", project: "广德慢病项目", scene: "慢病随访", archived: true, medical: true, registered: "2026-08-09 10:18:00", login: "2026-08-18 13:20:00", archiveId: "pa-7" },
          { id: "op-18", name: "周明远", gender: "男", phone: "136****2890", diagnosis: "2型糖尿病", hospital: "广德人民医院", doctor: "王医生", project: "广德慢病项目", scene: "用药提醒", archived: true, medical: true, registered: "2026-08-10 16:05:00", login: "2026-08-18 09:44:00", archiveId: "pa-8" },
          { id: "op-19", name: "唐婉宁", gender: "女", phone: "158****3826", diagnosis: "甲状腺结节", hospital: "中山医院", doctor: "李医生", project: "中山肿瘤随访", scene: "健康宣教", archived: true, medical: true, registered: "2026-08-11 09:12:00", login: "2026-08-17 16:12:00", archiveId: "pa-9" },
          { id: "op-20", name: "何志勇", gender: "男", phone: "139****0416", diagnosis: "高血脂", hospital: "广德人民医院", doctor: "陈医生", project: "广德慢病项目", scene: "慢病随访", archived: true, medical: true, registered: "2026-08-12 14:26:00", login: "2026-08-17 11:03:00", archiveId: "pa-10" }
        ];

        function patientTagType(name) {
          var option = patientArchiveTagOptions.concat(getPatientTagOptions()).filter(function (item) { return item.name === name; })[0];
          if (option) return option.tagType;
          return { "慢病管理": "租户标签", "复诊提醒": "个人标签", "用药提醒": "个人标签", "健康宣教": "租户标签" }[name] || "";
        }
        function patientTagScopeAttribute(name, type) {
          return ' data-tag-scope="' + escapeHtml(type || patientTagType(name)) + '"';
        }
        function renderPatientTag(name) {
          return '<span class="ops-tag"' + patientTagScopeAttribute(name) + '>' + escapeHtml(name) + '</span>';
        }
        function renderTagAudience(audience) {
          return audience.indexOf("标签：") === 0 ? "标签：" + renderPatientTag(audience.slice(3)) : escapeHtml(audience);
        }
        function renderLabelRows() {
          var showOperations = state.labelTab === "个人标签";
          var rows = labelRows[state.labelTab].filter(function (row) {
            if (!state.labelApplied) return true;
            return (row.name + row.type + (row.parent || "")).indexOf(state.labelApplied) >= 0;
          });
          if (!rows.length) return '<tr><td colspan="' + (showOperations ? 6 : 5) + '"><div class="ops-empty">暂无符合条件的标签</div></td></tr>';
          return rows.map(function (row) {
            var hidden = false;
            if (row.parent && state.labelCollapsed[row.parent]) hidden = true;
            if (row.level === 3) {
              var parentRow = labelRows[state.labelTab].filter(function (candidate) { return candidate.name === row.parent; })[0];
              if (parentRow && parentRow.parent && state.labelCollapsed[parentRow.parent]) hidden = true;
            }
            if (hidden && !state.labelApplied) return "";
            var toggle = row.level < 3 ? '<button class="ops-tree-toggle" type="button" data-action="label-toggle" data-value="' + escapeHtml(row.name) + '" aria-label="展开或收起' + escapeHtml(row.name) + '">' + icon(state.labelCollapsed[row.name] ? "fa-chevron-right" : "fa-chevron-down") + "</button>" : '<span style="width:24px"></span>';
            var actions = "";
            if (showOperations) {
              actions = '<div class="ops-row-actions"><button class="ops-link" type="button" data-action="label-edit" data-name="' + escapeHtml(row.name) + '">编辑</button>';
              if (row.level === 1) actions += '<button class="ops-link" type="button" data-action="label-add-level2" data-name="' + escapeHtml(row.name) + '">添加二级标签</button>';
              if (row.level === 2) actions += '<button class="ops-link" type="button" data-action="label-add-name" data-name="' + escapeHtml(row.name) + '">添加标签名称</button>';
              actions += '<button class="ops-link ops-link-danger" type="button" data-action="label-delete" data-name="' + escapeHtml(row.name) + '">删除</button></div>';
            }
            return '<tr><td><span class="ops-tree-name level-' + row.level + '"' + patientTagScopeAttribute(row.name, state.labelTab) + '>' + toggle + '<strong>' + escapeHtml(row.name) + '</strong></span></td><td>' + escapeHtml(row.type) + '</td><td>' + escapeHtml(row.sort) + '</td><td>2026-04-01 10:00:00</td><td>2026-08-18 14:52:31</td>' + (showOperations ? '<td>' + actions + "</td>" : "") + "</tr>";
          }).join("");
        }

        function renderLabelPage() {
          var editable = state.labelTab === "个人标签";
          var tabs = ["个人标签", "租户标签", "平台标签"].map(function (tab) {
            return '<button type="button" role="tab" aria-selected="' + (state.labelTab === tab ? "true" : "false") + '" class="' + (state.labelTab === tab ? "is-active" : "") + '" data-action="label-tab" data-value="' + tab + '">' + tab + "</button>";
          }).join("");
          var filter = '<div class="ops-filter-panel" style="grid-template-columns:minmax(220px,360px) auto"><label class="ops-field"><span class="ops-field-label">标签名称</span><input id="ops-label-search" data-bind="label.search" value="' + escapeHtml(state.labelSearch) + '" placeholder="请输入标签名称"></label><div class="ops-filter-actions">' + button("重置", "", "label-reset") + button("查询", "primary", "label-search") + "</div></div>";
          var listTools = '<div class="ops-toolbar-row"><strong>' + escapeHtml(state.labelTab) + '列表</strong></div>';
          var showOperations = state.labelTab === "个人标签";
          var table = '<section class="ops-card ops-table-panel"><div class="ops-table-scroll"><table class="ops-table" style="min-width:' + (showOperations ? "1220px" : "960px") + '" aria-label="标签列表"><thead><tr><th style="min-width:260px">标签名称</th><th>标签类型</th><th>排序值</th><th>创建时间</th><th>修改时间</th>' + (showOperations ? '<th style="min-width:260px">操作</th>' : "") + '</tr></thead><tbody>' + renderLabelRows() + "</tbody></table></div></section>";
          return '<section class="ops-page ops-list-page" style="grid-template-rows:auto auto auto minmax(0,1fr) auto">' + toolbar(["首页", "患者管理", "标签管理"], renderIconActions(editable ? "添加一级标签" : "", "label-add-level1")) + '<div class="ops-label-scope-buttons" role="tablist" aria-label="标签范围">' + tabs + "</div>" + filter + '<div style="min-height:0;display:grid;grid-template-rows:auto minmax(0,1fr)">' + listTools + table + '</div><footer class="ops-pagination"><span>共 ' + labelRows[state.labelTab].length + ' 条</span><button class="ops-page-number" type="button" aria-current="page">1</button><span>/ 1</span></footer></section>';
        }

        function messageStatusCount(status) {
          if (status === "全部") return messageTasks.length;
          return messageTasks.filter(function (task) { return task.status === status; }).length;
        }

        function messageDateMatches(value, start, end) {
          if (!start && !end) return true;
          var match = String(value || "").match(/^\d{4}-\d{2}-\d{2}/);
          if (!match) return false;
          var date = match[0];
          return (!start || date >= start) && (!end || date <= end);
        }

        function filteredMessageTasks() {
          var filter = state.messageFilterApplied;
          return messageTasks.filter(function (task) {
            var statusMatch = state.messageStatus === "全部" || task.status === state.messageStatus;
            var nameMatch = !filter.taskName || task.name.indexOf(filter.taskName) >= 0;
            var creatorMatch = !filter.creator || task.creator.indexOf(filter.creator) >= 0;
            var typeMatch = filter.sendType === "全部" || task.sendType === filter.sendType;
            return statusMatch && nameMatch && creatorMatch && typeMatch && messageDateMatches(task.createdAt, filter.createdStart, filter.createdEnd) && messageDateMatches(task.sentAt, filter.sentStart, filter.sentEnd);
          });
        }

        function renderMessageMetric(value, tone) {
          if (value === null || value === undefined) return "--";
          var className = tone === "danger" && value > 0 ? "is-danger" : tone === "neutral" || tone === "danger" ? "is-neutral" : "";
          return '<span class="ops-metric-number ' + className + '">' + value + "</span>";
        }

        function positionMessageMoreMenu(id) {
          window.requestAnimationFrame(function () {
            if (!shell || state.moreMenu !== id) return;
            var trigger = shell.querySelector('[data-action="message-more"][data-id="' + id + '"]');
            var menu = shell.querySelector(".ops-more-menu");
            if (!trigger || !menu) return;
            var triggerRect = trigger.getBoundingClientRect();
            var menuRect = menu.getBoundingClientRect();
            var top = triggerRect.bottom + 4;
            if (top + menuRect.height > window.innerHeight - 8) top = Math.max(8, triggerRect.top - menuRect.height - 4);
            var left = Math.max(8, Math.min(triggerRect.right - menuRect.width, window.innerWidth - menuRect.width - 8));
            menu.style.top = Math.round(top) + "px";
            menu.style.left = Math.round(left) + "px";
          });
        }

        function renderMessageMoreMenu() {
          if (!state.moreMenu) return "";
          var task = messageTasks.find(function (item) { return item.id === state.moreMenu; });
          if (!task) return "";
          return '<div class="ops-more-menu" role="menu" aria-label="消息任务更多操作"><button type="button" data-action="message-copy" data-id="' + task.id + '">复制任务</button>' + (task.failed ? '<button type="button" data-action="message-retry" data-id="' + task.id + '">失败消息重发</button>' : "") + (task.status === "进行中" || task.status === "待执行" ? '<button class="is-danger" type="button" data-action="message-cancel" data-id="' + task.id + '">取消任务</button>' : "") + "</div>";
        }

        function renderMessageRows() {
          var rows = filteredMessageTasks();
          if (!rows.length) return '<tr><td colspan="12"><div class="ops-empty">暂无符合条件的消息任务</div></td></tr>';
          return rows.map(function (task) {
            var statusClass = task.status === "异常任务" ? "is-red" : task.status === "待执行" ? "is-pending" : task.status === "已取消" ? "is-gray" : task.status === "已完成" ? "is-green" : "";
            var more = '<div class="ops-more-wrap"><button class="ops-link" type="button" data-action="message-more" data-id="' + task.id + '">更多 ' + icon("fa-chevron-down") + "</button></div>";
            return '<tr><td>' + escapeHtml(task.name) + '</td><td><span class="ops-cell-summary">' + escapeHtml(task.content) + '</span></td><td><span class="ops-cell-summary">' + renderTagAudience(task.audience) + '</span></td><td>' + renderMessageMetric(task.target, "neutral") + '</td><td>' + renderMessageMetric(task.success, "success") + '</td><td>' + renderMessageMetric(task.failed, "danger") + '</td><td>' + escapeHtml(task.sendType) + '</td><td><span class="ops-tag ops-message-status-tag ' + statusClass + '">' + escapeHtml(task.status) + '</span></td><td>' + escapeHtml(task.sentAt) + '</td><td>' + escapeHtml(task.createdAt) + '</td><td>' + escapeHtml(task.creator) + '</td><td><div class="ops-row-actions"><button class="ops-link" type="button" data-action="message-view" data-id="' + task.id + '">查看详情</button>' + more + "</div></td></tr>";
          }).join("");
        }

        function renderMessageListPage() {
          var draft = state.messageFilterDraft;
          var rows = filteredMessageTasks();
          var statuses = ["全部", "进行中", "异常任务", "待执行", "已取消", "已完成"].map(function (status) {
            return '<button type="button" class="' + (state.messageStatus === status ? "is-active" : "") + '" data-action="message-status" data-value="' + status + '">' + status + '<span class="ops-count-badge">' + messageStatusCount(status) + "</span></button>";
          }).join("");
          var sendOptions = ["全部", "立即", "定时"].map(function (item) { return '<option' + (draft.sendType === item ? " selected" : "") + '>' + item + "</option>"; }).join("");
          var filter = '<div class="ops-filter-panel ops-message-filter"><label class="ops-field"><span class="ops-field-label">任务名称</span><input id="ops-message-search" data-bind="messageFilter.taskName" value="' + escapeHtml(draft.taskName) + '" placeholder="请输入任务名称"></label><label class="ops-field"><span class="ops-field-label">创建人</span><input data-bind="messageFilter.creator" value="' + escapeHtml(draft.creator) + '" placeholder="请输入创建人"></label><label class="ops-field"><span class="ops-field-label">发送类型</span><select data-bind="messageFilter.sendType">' + sendOptions + '</select></label><div class="ops-field ops-message-date-field"><span class="ops-field-label">创建时间</span><div class="ops-message-date-range"><input type="date" data-bind="messageFilter.createdStart" value="' + escapeHtml(draft.createdStart) + '" aria-label="创建开始日期"><span>至</span><input type="date" data-bind="messageFilter.createdEnd" value="' + escapeHtml(draft.createdEnd) + '" aria-label="创建结束日期"></div></div><div class="ops-field ops-message-date-field"><span class="ops-field-label">发送时间</span><div class="ops-message-date-range"><input type="date" data-bind="messageFilter.sentStart" value="' + escapeHtml(draft.sentStart) + '" aria-label="发送开始日期"><span>至</span><input type="date" data-bind="messageFilter.sentEnd" value="' + escapeHtml(draft.sentEnd) + '" aria-label="发送结束日期"></div></div><div class="ops-filter-actions ops-message-filter-actions">' + button("重置", "", "message-reset") + button("查询", "primary", "message-search") + "</div></div>";
          var table = '<section class="ops-card ops-table-panel"><div class="ops-table-scroll"><table class="ops-table ops-message-table" style="min-width:1780px" aria-label="消息触达任务列表"><thead><tr><th>任务名称</th><th>发送内容</th><th>群发对象</th><th>目标总数</th><th>触达成功</th><th>触达失败</th><th>发送类型</th><th>发送状态</th><th>发送时间</th><th>创建时间</th><th>创建人</th><th>操作</th></tr></thead><tbody>' + renderMessageRows() + "</tbody></table></div></section>";
          return '<section class="ops-page ops-list-page ops-message-page" style="grid-template-rows:auto auto auto auto minmax(0,1fr) auto">' + toolbar(["首页", "运营管理", "消息触达"], renderIconActions("添加任务", "message-new")) + '<div class="ops-tabs-line"><button class="is-active" type="button">单聊群发</button></div><div class="ops-message-statuses">' + statuses + "</div>" + filter + table + '<footer class="ops-pagination"><span>共 ' + rows.length + ' 条</span><button class="ops-page-number" type="button" aria-current="page">1</button><span>/ 1</span></footer>' + renderMessageMoreMenu() + "</section>";
        }

        function renderRecipientRows() {
          return recipients.map(function (item) {
            var checked = state.selectedRecipients.indexOf(item.id) >= 0;
            return '<tr><td><input type="checkbox" data-recipient="' + item.id + '" ' + (checked ? "checked" : "") + ' aria-label="选择' + escapeHtml(item.name) + '"></td><td class="ops-cell-strong">' + escapeHtml(item.name) + '</td><td>' + escapeHtml(item.diagnosis) + '</td><td>' + escapeHtml(item.phone) + '</td><td>' + escapeHtml(item.gender) + '</td><td>' + escapeHtml(item.age) + "</td></tr>";
          }).join("");
        }

        function renderMessageTaskCreatePage() {
          var draft = state.messageDraft;
          var selectedCount = state.selectedRecipients.length;
          var allRecipientsSelected = recipients.length > 0 && selectedCount === recipients.length;
          var doctorOptionsHtml = ["张医生", "李医生", "陈医生"].map(function (name) { return '<option' + (draft.doctor === name ? ' selected' : '') + '>' + name + '</option>'; }).join("");
          var genderOptionsHtml = ["不限（全选）", "男", "女"].map(function (name) { return '<option' + (draft.gender === name ? ' selected' : '') + '>' + name + '</option>'; }).join("");
          var messageMaterialOptions = [];
          ["租户素材"].forEach(function (scope) {
            materials[scope].filter(function (item) { return item.purpose.indexOf("推送") >= 0; }).forEach(function (item) {
              messageMaterialOptions.push({ name: item.name, scope: scope });
            });
          });
          var selectedMaterial = messageMaterialOptions.filter(function (item) { return item.name === draft.contentSource; })[0];
          var selectedMaterialValue = selectedMaterial
            ? '<span>' + escapeHtml(selectedMaterial.name) + '</span><span class="ops-message-material-scope' + (selectedMaterial.scope === "租户素材" ? " is-tenant" : "") + '">' + escapeHtml(selectedMaterial.scope) + '</span>'
            : '<span>不引用素材</span>';
          var messageMaterialRows = '<button class="ops-message-material-option' + (draft.contentSource === "不引用素材" ? " is-selected" : "") + '" type="button" role="option" aria-selected="' + (draft.contentSource === "不引用素材" ? "true" : "false") + '" data-action="message-material-select" data-value="不引用素材"><span>不引用素材</span></button>' + messageMaterialOptions.map(function (item) {
            var selected = draft.contentSource === item.name;
            return '<button class="ops-message-material-option' + (selected ? " is-selected" : "") + '" type="button" role="option" aria-selected="' + (selected ? "true" : "false") + '" data-action="message-material-select" data-value="' + escapeHtml(item.name) + '"><span>' + escapeHtml(item.name) + '</span><span class="ops-message-material-scope' + (item.scope === "租户素材" ? " is-tenant" : "") + '">' + escapeHtml(item.scope) + "</span></button>";
          }).join("");
          var messageMaterialPicker = '<div class="ops-field"><span class="ops-field-label">引用素材</span><div class="ops-message-material-picker" data-message-material-picker><button class="ops-message-material-trigger" type="button" data-action="message-material-toggle" aria-haspopup="listbox" aria-expanded="' + (state.messageMaterialOpen ? "true" : "false") + '"><span class="ops-message-material-value">' + selectedMaterialValue + '</span>' + icon(state.messageMaterialOpen ? "fa-chevron-up" : "fa-chevron-down") + '</button><div class="ops-message-material-dropdown" role="listbox" aria-label="引用素材"' + (state.messageMaterialOpen ? "" : " hidden") + '>' + messageMaterialRows + "</div></div></div>";
          var sendTimeField = draft.sendType === "定时发送"
            ? '<label class="ops-field"><span class="ops-field-label"><span class="ops-required">*</span>发送时间</span><input type="datetime-local" data-bind="message.sendAt" value="' + escapeHtml(draft.sendAt) + '"></label>'
            : '<div aria-hidden="true"></div>';
          var diagnosis = '<div class="ops-field ops-diagnosis-field"><span class="ops-field-label">诊断</span><div class="ops-diagnosis-control"><input readonly value="' + escapeHtml(draft.diagnosis) + '" placeholder="暂未添加诊断条件，点击右侧按钮添加"><button class="ops-button ops-dashed-button" type="button" data-action="message-disease">' + icon("fa-plus") + '<span>添加疾病</span></button></div><p class="ops-diagnosis-help">多个疾病取 AND 交集（模糊匹配）</p></div>';
          var basic = '<section class="ops-card ops-task-card ops-message-create-basic"><h2>基础信息</h2><div class="ops-form-grid"><label class="ops-field"><span class="ops-field-label"><span class="ops-required">*</span>任务名称</span><input data-bind="message.taskName" data-initial-focus value="' + escapeHtml(draft.taskName) + '" maxlength="30" placeholder="请输入任务名称"></label><label class="ops-field"><span class="ops-field-label"><span class="ops-required">*</span>发送方式</span><select data-bind="message.sendType"><option' + (draft.sendType === "立即发送" ? ' selected' : '') + '>立即发送</option><option' + (draft.sendType === "定时发送" ? ' selected' : '') + '>定时发送</option></select></label>' + sendTimeField + '</div></section>';
          var filters = '<section class="ops-card ops-task-card ops-message-create-filter"><h2>筛选对象</h2><div class="ops-form-grid">' + diagnosis + '<label class="ops-field"><span class="ops-field-label">托管医生</span><select data-bind="message.doctor"><option value="">请选择托管医生</option>' + doctorOptionsHtml + '</select></label><label class="ops-field"><span class="ops-field-label">年龄范围</span><div class="ops-inline-actions"><input style="width:45%" data-bind="message.ageMin" value="' + escapeHtml(draft.ageMin) + '" placeholder="最小年龄"><span>至</span><input style="width:45%" data-bind="message.ageMax" value="' + escapeHtml(draft.ageMax) + '" placeholder="最大年龄"></div></label><label class="ops-field"><span class="ops-field-label">性别</span><select data-bind="message.gender">' + genderOptionsHtml + '</select></label><label class="ops-field"><span class="ops-field-label">手机号</span><input data-bind="message.phone" value="' + escapeHtml(draft.phone) + '" placeholder="不填则默认全选"></label><label class="ops-field"><span class="ops-field-label">姓名</span><input data-bind="message.name" value="' + escapeHtml(draft.name) + '" placeholder="不填则默认全选"></label></div><div class="ops-inline-actions" style="justify-content:flex-end;margin-top:16px">' + button("重置", "", "recipient-reset") + button("查询", "primary", "recipient-search") + '</div></section>';
          var recipientsPanel = '<section class="ops-card ops-task-card"><div class="ops-recipient-summary-bar"><div><div class="ops-recipient-summary">共检索到 ' + recipients.length + ' 位患者，请勾选推送对象并编辑消息</div><h2 style="margin:10px 0 0">推送对象</h2></div><div class="ops-inline-actions"><span>已选 ' + selectedCount + ' 人</span><button class="ops-link" type="button" data-action="recipient-current">全选当前页</button><button class="ops-link" type="button" data-action="recipient-all">全选所有</button><button class="ops-link" type="button" data-action="recipient-none">取消全选</button></div></div><div class="ops-recipient-table"><table><thead><tr><th><input type="checkbox" data-recipient-all ' + (allRecipientsSelected ? "checked" : "") + ' aria-label="全选推送对象"></th><th>患者姓名</th><th>诊断</th><th>手机号</th><th>性别</th><th>年龄</th></tr></thead><tbody>' + renderRecipientRows() + '</tbody></table></div></section>';
          var messageContent = '<section class="ops-card ops-task-card"><h2>消息内容</h2><div class="ops-form-grid" style="grid-template-columns:1fr">' + messageMaterialPicker + '<label class="ops-field"><span class="ops-field-label"><span class="ops-required">*</span>消息正文</span><textarea data-bind="message.content" maxlength="1000" placeholder="请输入消息正文">' + escapeHtml(draft.content) + '</textarea></label></div></section>';
          var preview = '<section class="ops-card ops-task-card"><h2>发送预览</h2><p>将向已选择的 ' + selectedCount + ' 位患者发送：</p><div class="ops-preview-box" id="ops-message-preview">' + escapeHtml(draft.content || "消息内容将在此处预览") + '</div><p class="ops-field-hint" style="margin-top:14px">发送前请确认接收人范围和消息内容。</p></section>';
          var queryResult = state.messageRecipientSearched ? '<div class="ops-message-create-lower">' + recipientsPanel + '<div class="ops-message-create-right">' + messageContent + preview + '</div></div>' : '';
          var body = '<div class="ops-page-scroll"><h1 class="ops-page-title">新建消息任务</h1><div class="ops-message-create-stack">' + basic + filters + queryResult + '</div></div>';
          return '<section class="ops-page">' + toolbar(["首页", "运营管理", "消息触达", "新建消息任务"], "") + body + '<footer class="ops-form-footer">' + button("取消", "", "message-create-cancel") + button("确定发送", "primary", "message-send") + "</footer></section>";
        }
        function renderDoctorTodosPage() {
          return '<section class="ops-page ops-my-todos-page">'+toolbar(["首页","会话管理","我的待办"],"")+'<iframe class="ops-my-todos-frame" title="我的待办" src="my-todos.html?embedded=1&amp;host=web" referrerpolicy="same-origin"></iframe></section>';
        }

        function renderFollowupRulesPage() {
          var rows = followupRules.map(function (rule, index) {
            return '<tr><td>' + (index + 1) + '</td><td class="ops-cell-strong">' + escapeHtml(rule.name) + '</td><td>' + escapeHtml(rule.trigger) + '</td><td><span class="ops-tag is-blue">命中后自动创建</span><br><span class="ops-cell-summary">' + escapeHtml(rule.task) + '</span></td><td><span class="ops-cell-summary">' + escapeHtml(rule.reply) + '</span></td><td><span class="ops-tag ' + (rule.status === "已启用" ? "is-green" : "is-gray") + '">' + escapeHtml(rule.status) + '</span></td><td><button class="ops-link" type="button" data-action="followup-rule-preview" data-id="' + (index + 1) + '">查看链路</button></td></tr>';
          }).join("");
          var flow = '<section class="ops-card ops-followup-flow"><h2>规则命中后的连续路径</h2><div class="ops-followup-steps"><div class="ops-followup-step"><strong>1 · 规则命中</strong><p>读取患者端打卡、问答或预约事件，不读取无关敏感字段。</p></div><div class="ops-followup-step"><strong>2 · 自动创建任务</strong><p>生成带患者、项目和截止时间的随访任务，保留审计记录。</p></div><div class="ops-followup-step"><strong>3 · 发送患者</strong><p>发送已审核的文本、海报或视频素材，展示任务状态。</p></div><div class="ops-followup-step"><strong>4 · 反馈与转人工</strong><p>超出知识库、出现不适或患者主动求助时暂停自动回复并转人工。</p></div></div><div class="ops-followup-copy"><div class="ops-followup-message"><h3>轻微不良反应话术示例</h3><p>患者：吃完后有点恶心，需要停药吗？<br>助手：我可以先帮您记录“饭后轻微恶心”和发生时间。是否停药或调整用药需要由医生结合您的情况判断，我先转交医助跟进；如果不适明显加重，请及时使用就医入口。</p></div><div class="ops-followup-handoff"><h3>转人工状态</h3><p>状态：待医助接管<br>原因：不适反馈 + 超出自动回答边界<br>自动回复：已暂停</p></div></div></section>';
          var table = '<section class="ops-card ops-table-panel"><div class="ops-table-scroll"><table class="ops-table" style="min-width:1120px" aria-label="随访规则列表"><thead><tr><th>序号</th><th>规则名称</th><th>触发条件</th><th>命中动作</th><th>发送患者话术</th><th>状态</th><th>操作</th></tr></thead><tbody>' + rows + '</tbody></table></div></section>';
          return '<section class="ops-page ops-list-page" style="grid-template-rows:auto auto minmax(0,1fr)">' + toolbar(["首页", "运营管理", "随访规则"], button("新建规则", "primary", "followup-rule-new", "", "fa-plus")) + flow + table + '</section>';
        }
        function renderCareEntryPage() {
          var cards = '<div class="ops-followup-steps"><div class="ops-followup-step"><strong>合规购药入口</strong><p>仅展示已审核机构和官方服务入口，患者自行确认后跳转。</p><button class="ops-link" type="button" data-action="care-entry-open">查看机构入口</button></div><div class="ops-followup-step"><strong>预约就医入口</strong><p>跳转到预约页面，不替患者选择医院、科室或药品。</p><button class="ops-link" type="button" data-action="care-entry-open">查看预约入口</button></div><div class="ops-followup-step"><strong>人工咨询</strong><p>无法回答或出现不适时，进入人工接管队列。</p><button class="ops-link" type="button" data-action="care-entry-human">转人工</button></div></div>';
          return '<section class="ops-page"><div class="ops-page-scroll">' + toolbar(["首页", "运营管理", "合规服务入口"], "") + '<section class="ops-card ops-followup-flow"><h1 style="margin:0;color:#173b5f">合规购药 / 就医入口</h1><div class="ops-safety-copy"><strong>责任边界</strong><span>平台只提供已审核的购药或就医入口，不直接给出购药结论，不替代医生诊疗判断。患者提交前可返回会话或请求人工帮助。</span></div>' + cards + '<div class="ops-safety-copy"><strong>拒答话术</strong><span>“我无法根据当前信息判断是否需要购药或应该选择哪种药。这里提供合规服务入口，您也可以转人工，由医助协助记录问题并说明下一步。”</span></div></section></div></section>';
        }

        function renderHomeMetric(title, value, color, items) {
          return '<article class="ops-home-metric" style="--metric-color:' + color + ';--metric-cols:' + items.length + '"><h2>' + escapeHtml(title) + '</h2><strong>' + escapeHtml(value) + '</strong><div class="ops-home-metric-meta">' + items.map(function (item) { return '<span>' + escapeHtml(item[0]) + '<b>' + escapeHtml(item[1]) + '</b></span>'; }).join("") + '</div></article>';
        }

        function renderHomePage() {
          var metrics = renderHomeMetric("医生总数", "9", "#14833b", [["已托管", "3"], ["未托管", "6"]]) +
            renderHomeMetric("患者总数", "20", "#7338ee", [["已建档", "18"], ["已上传病历", "12"]]) +
            renderHomeMetric("托管账号总数", "6", "#d84b00", [["在线", "3"], ["离线", "2"], ["二次验证", "1"]]) +
            renderHomeMetric("消息任务数", "5", "#0873c9", [["待执行", "1"], ["进行中", "1"], ["异常任务", "1"]]);
          var quickItems = [
            { title: "患者档案", desc: "集中查看患者基本资料、标签、诊断和随访信息。", meta: "患者总数", value: "20", color: "#0873c9", icon: "fa-address-card", route: "patient-archives" },
            { title: "聚合聊天", desc: "统一接待医生企微会话，快速跟进患者咨询。", meta: "当前会话", value: "6", color: "#5669c9", icon: "fa-comments", route: "aggregate-chat" },
            { title: "消息触达", desc: "创建并跟踪消息任务，掌握发送进度与触达结果。", meta: "任务总数", value: "5", color: "#159b8d", icon: "fa-comment-dots", route: "message-tasks" },
            { title: "标签管理", desc: "维护患者标签层级，支持筛选与运营应用。", meta: "标签数量", value: "14", color: "#7455df", icon: "fa-tags", route: "tag-management" },
            { title: "素材管理", desc: "统一管理文本、图片、网页等运营素材及分组。", meta: "公共素材总数", value: "350", color: "#df7a00", icon: "fa-folder-open", route: "materials" }
          ];
          var quick = quickItems.map(function (item) {
            return '<article class="ops-home-quick" style="--quick-color:' + item.color + '"><span class="ops-home-quick-icon">' + icon(item.icon) + '</span><div class="ops-home-quick-copy"><h3>' + escapeHtml(item.title) + '</h3><p>' + escapeHtml(item.desc) + '</p><div class="ops-home-quick-footer"><span>' + escapeHtml(item.meta) + '：<b>' + escapeHtml(item.value) + '</b></span><button class="ops-button ops-button-primary" type="button" data-route="' + item.route + '"><span>进入</span>' + icon("fa-chevron-right") + '</button></div></div></article>';
          }).join("");
          var body = '<div class="ops-home-content"><header class="ops-home-greeting"><div><h1>下午好，管理员</h1><p>欢迎回到卓睦鸟患管后台</p></div><time>数据更新时间：2026-09-11 01:42</time></header><section class="ops-home-metrics" aria-label="数据概览">' + metrics + '</section><section class="ops-home-quick-grid">' + quick + '</section></div>';
          return '<section class="ops-page ops-home-page">' + body + '</section>';
        }

        function filteredPatientArchives() {
          var f = state.patientArchiveApplied;
          var selectedTags = Array.isArray(f.tags) ? f.tags : [];
          return patientArchives.filter(function (item) {
            return (!f.name || item.name.indexOf(f.name) >= 0) &&
              (!f.phone || item.phone.indexOf(f.phone) >= 0) &&
              (!f.project || item.project === f.project) &&
              (!f.scene || item.scene === f.scene) &&
              (!f.doctor || item.doctor.indexOf(f.doctor) >= 0) &&
              (!selectedTags.length || selectedTags.some(function (tag) { return item.tags.indexOf(tag) >= 0; })) &&
              (!f.diagnosis || item.diagnosis.indexOf(f.diagnosis) >= 0);
          });
        }

        var PATIENT_AVATAR_IMAGE = "./page-assets/images/24d2d78933897c032d7dca4648519fb746df7209419e38da59d9c1c3198778ef.png";

        function renderPatientArchiveCard(item) {
          var tags = item.tags.map(renderPatientTag).join("");
          return '<button class="ops-patient-card" type="button" data-action="patient-detail" data-id="' + item.id + '"><img class="ops-patient-card-avatar" src="' + PATIENT_AVATAR_IMAGE + '" alt=""><span><span class="ops-patient-card-head"><strong>' + escapeHtml(item.name) + '</strong><span class="ops-patient-card-tags">' + tags + '</span></span><span class="ops-patient-card-sub">' + escapeHtml(item.gender) + '　' + item.age + '岁　|　' + escapeHtml(item.phone) + '</span><dl class="ops-patient-card-facts"><dt>诊断</dt><dd>' + escapeHtml(item.diagnosis) + '</dd><dt>所属项目</dt><dd>' + escapeHtml(item.project) + '</dd><dt>托管医生</dt><dd>' + escapeHtml(item.doctor) + '</dd><dt>场景名称</dt><dd>' + escapeHtml(item.scene) + '</dd></dl></span></button>';
        }

        function renderPatientArchivesPage() {
          var draft = state.patientArchiveDraft;
          var rows = filteredPatientArchives();
          function option(value, label, current) { return '<option value="' + escapeHtml(value) + '"' + (value === current ? ' selected' : '') + '>' + escapeHtml(label) + '</option>'; }
          var selectedTags = Array.isArray(draft.tags) ? draft.tags : [];
          var tagQuery = String(state.patientArchiveTagSearch || "").trim().toLowerCase();
          var patientTagChips = selectedTags.map(function (tag) {
            return '<span class="ops-patient-archive-tag-chip"' + patientTagScopeAttribute(tag) + '><span title="' + escapeHtml(tag) + '">' + escapeHtml(tag) + '</span><button type="button" data-action="patient-tag-remove" data-tag="' + escapeHtml(tag) + '" aria-label="移除标签' + escapeHtml(tag) + '">' + icon("fa-xmark") + '</button></span>';
          }).join("");
          var visibleTagCount = 0;
          var patientTagOptionsHtml = patientArchiveTagOptions.map(function (tag) {
            var selected = selectedTags.indexOf(tag.name) >= 0;
            var visible = !tagQuery || tag.name.toLowerCase().indexOf(tagQuery) >= 0;
            if (visible) visibleTagCount += 1;
            return '<button class="ops-patient-archive-tag-option' + (selected ? ' is-selected' : '') + '" type="button" role="option" aria-selected="' + (selected ? 'true' : 'false') + '" data-action="patient-tag-select" data-patient-archive-tag-option' + patientTagScopeAttribute(tag.name, tag.tagType) + ' data-tag-name="' + escapeHtml(tag.name) + '" data-tag="' + escapeHtml(tag.name) + '"' + (visible ? '' : ' hidden') + '><span class="ops-patient-archive-tag-check" aria-hidden="true">' + (selected ? icon("fa-check") : '') + '</span><strong title="' + escapeHtml(tag.name) + '">' + escapeHtml(tag.name) + '</strong><span title="' + escapeHtml(tag.level2) + '">' + escapeHtml(tag.level2) + '</span><span title="' + escapeHtml(tag.level1) + '">' + escapeHtml(tag.level1) + '</span><span class="ops-tag"' + patientTagScopeAttribute(tag.name, tag.tagType) + '>' + escapeHtml(tag.tagType) + '</span></button>';
          }).join("");
          var patientTagDropdown = '<div class="ops-patient-archive-tag-dropdown" id="ops-patient-archive-tag-options" role="listbox" aria-label="患者标签搜索结果" aria-multiselectable="true" data-patient-archive-tag-options' + (state.patientArchiveTagOpen ? '' : ' hidden') + '><div class="ops-patient-archive-tag-option-head" aria-hidden="true"><span></span><span>标签名称</span><span>二级标签</span><span>一级标签</span><span>标签类型</span></div>' + patientTagOptionsHtml + '<div class="ops-patient-archive-tag-empty" data-patient-archive-tag-empty' + (visibleTagCount ? ' hidden' : '') + '>暂无匹配的标签名称</div></div>';
          var patientTagFilter = '<div class="ops-field"><span class="ops-field-label">患者标签</span><div class="ops-patient-archive-tag-filter" data-patient-archive-tag-filter><div class="ops-patient-archive-tag-trigger" data-action="patient-tag-open">' + patientTagChips + '<input data-bind="patient.tagSearch" value="' + escapeHtml(state.patientArchiveTagSearch) + '" placeholder="请输入标签名称" role="combobox" aria-autocomplete="list" aria-expanded="' + (state.patientArchiveTagOpen ? 'true' : 'false') + '" aria-controls="ops-patient-archive-tag-options" autocomplete="off"><span class="ops-patient-archive-tag-chevron" aria-hidden="true">' + icon(state.patientArchiveTagOpen ? "fa-chevron-up" : "fa-chevron-down") + '</span></div>' + patientTagDropdown + '</div></div>';
          var diagnosis = '<div class="ops-field ops-diagnosis-field"><span class="ops-field-label">诊断</span><div class="ops-diagnosis-control"><input readonly value="' + escapeHtml(draft.diagnosis) + '" placeholder="暂未添加诊断条件，点击右侧按钮添加"><button class="ops-button ops-dashed-button" type="button" data-action="patient-disease">' + icon("fa-plus") + '<span>添加疾病</span></button></div><p class="ops-diagnosis-help">多个疾病取 AND 交集（模糊匹配）</p></div>';
          var filters = '<div class="ops-filter-panel ops-patient-filter"><label class="ops-field"><span class="ops-field-label">患者姓名</span><input data-bind="patient.name" value="' + escapeHtml(draft.name) + '" placeholder="请输入患者姓名"></label><label class="ops-field"><span class="ops-field-label">手机号</span><input data-bind="patient.phone" value="' + escapeHtml(draft.phone) + '" placeholder="请输入手机号"></label><label class="ops-field"><span class="ops-field-label">所属项目</span><select data-bind="patient.project">' + option("", "请选择所属项目", draft.project) + option("广德慢病项目", "广德慢病项目", draft.project) + option("中山肿瘤随访", "中山肿瘤随访", draft.project) + '</select></label><label class="ops-field"><span class="ops-field-label">场景名称</span><select data-bind="patient.scene">' + option("", "请选择场景名称", draft.scene) + option("慢病随访", "慢病随访", draft.scene) + option("用药提醒", "用药提醒", draft.scene) + option("健康宣教", "健康宣教", draft.scene) + '</select></label><label class="ops-field"><span class="ops-field-label">托管医生</span><input data-bind="patient.doctor" value="' + escapeHtml(draft.doctor) + '" placeholder="请输入托管医生"></label>' + patientTagFilter + diagnosis + '<div class="ops-filter-actions ops-patient-filter-actions">' + button("重置", "", "patient-reset") + button("查询", "primary", "patient-search") + '</div></div>';
          var cards = rows.length ? rows.map(renderPatientArchiveCard).join("") : '<div class="ops-card ops-empty" style="grid-column:1/-1">暂无符合条件的患者档案</div>';
          return '<section class="ops-page ops-list-page ops-patient-archive-page">' + toolbar(["首页", "患者管理", "患者档案"], renderIconActions("", "")) + filters + '<div class="ops-patient-card-grid">' + cards + '</div><footer class="ops-pagination"><span>共 ' + rows.length + ' 条</span><button class="ops-button" type="button" disabled>上一页</button><button class="ops-page-number" type="button" aria-current="page">1</button><button class="ops-page-number" type="button">2</button><button class="ops-page-number" type="button">3</button><button class="ops-button" type="button">下一页</button></footer></section>';
        }

        function patientScopedArchive(item) {
          var ctx=window.ChatPatientArchive.context({name:item.name,type:"私聊",tags:item.tags},item.doctor,item.scene);
          var resolved=ctx.project===item.project ? window.ChatPatientArchive.resolve(ctx) : {};
          return resolved.record || null;
        }
        function patientArchiveKey(item) {
          var record=patientScopedArchive(item);return record ? record.id : 'backend-'+item.id;
        }
        function patientHealthKey(item) {
          var record=patientScopedArchive(item),key=record ? record.id : 'backend-'+item.id;
          window.PatientHealth.seed(key,record ? record.metrics : []);return key;
        }
        function renderPatientHealthPanel(item) {
          return window.PatientHealth.render(patientHealthKey(item));
        }

        function renderPatientFollowupPanel(item) {
          var record=patientScopedArchive(item);
          return '<div style="padding:20px">'+window.PatientFollowups.render(patientArchiveKey(item),item.name,record ? record.followups : (patientFollowupRecords[item.id] || []))+'</div>';
        }

        function renderPatientMedicationPanel(item) {
          var record = patientScopedArchive(item);
          return '<div style="padding:20px">'+window.ChatPatientArchive.renderMedication(record ? record.medication : null)+'</div>';
        }

        function renderPatientArchiveDetailPage() {
          var item = patientArchives.filter(function (patient) { return patient.id === state.patientDetailId; })[0] || patientArchives[0];
          var tags = item.tags.map(renderPatientTag).join("");
          var phoneValue = state.patientDetailPhoneVisible ? item.fullPhone : item.phone;
          var back = '<button class="ops-link ops-patient-detail-back" type="button" data-action="patient-back">' + icon("fa-arrow-left") + '<span>返回患者列表</span></button>';
          var phone = '<p class="ops-patient-profile-sub"><span>' + escapeHtml(item.gender) + '　' + item.age + '岁　|　<span class="ops-patient-profile-phone" data-patient-detail-phone>' + escapeHtml(phoneValue) + '</span></span><button class="ops-link" type="button" data-action="patient-phone-toggle" aria-expanded="' + (state.patientDetailPhoneVisible ? 'true' : 'false') + '">' + (state.patientDetailPhoneVisible ? '隐藏' : '查看') + '</button></p>';
          var profile = '<section class="ops-patient-profile-card">' + back + '<div class="ops-patient-profile-main"><img class="ops-patient-profile-avatar" src="' + PATIENT_AVATAR_IMAGE + '" alt=""><div><div class="ops-patient-profile-name"><h1>' + escapeHtml(item.name) + '</h1></div>' + phone + '<div class="ops-inline-actions" style="margin-bottom:18px"><span style="color:#7189a5">标签：</span>' + tags + '<button class="ops-link" type="button" data-action="patient-tags-edit">' + icon("fa-pen-to-square") + ' 编辑标签</button></div><dl class="ops-patient-profile-facts"><div><dt>诊断</dt><dd data-patient-detail-diagnosis>' + escapeHtml(item.diagnosis || "未填写") + '</dd></div><div><dt>关联项目</dt><dd>' + escapeHtml(item.project) + '</dd></div><div><dt>场景名称</dt><dd>' + escapeHtml(item.scene) + '</dd></div><div><dt>托管医生</dt><dd>' + escapeHtml(item.doctor) + '</dd></div><div><dt>注册时间</dt><dd>' + escapeHtml(item.registered) + '</dd></div><div><dt>最近更新时间</dt><dd>' + escapeHtml(item.updated) + '</dd></div></dl></div></div></section>';
          var scopedArchive = patientScopedArchive(item);
          var visiblePatientTabs = window.ChatPatientArchive.tabsFor(scopedArchive,item.scene);
          if(visiblePatientTabs.indexOf(state.patientDetailTab)<0)state.patientDetailTab="病例时间轴";
          var tabs = visiblePatientTabs.map(function (tab) { return '<button class="' + (state.patientDetailTab === tab ? 'is-active' : '') + '" type="button" data-action="patient-detail-tab" data-value="' + tab + '">' + tab + '</button>'; }).join("");
          var timeline = patientMedicalTimeline[item.id] || { syncId: item.id.toUpperCase(), story: "该患者为合成演示数据，当前仅展示档案摘要。", metrics: [{ label: "随访阶段", value: "待建立" }], events: [] };
          var timelineBody = state.patientDetailTab === "专属档案" ? '<div style="padding:20px">'+window.ChatPatientArchive.renderExclusive(scopedArchive)+'</div>'
            : state.patientDetailTab === "病例时间轴"
            ? '<div class="ops-patient-timeline">' + window.ChatPatientArchive.renderTimeline(timeline.events, state.patientTimelineDetail, 'patient') + '</div>'
            : state.patientDetailTab === "指标汇总" ? window.PatientHealth.renderReports(patientHealthKey(item))
            : state.patientDetailTab === "基础健康指标" ? renderPatientHealthPanel(item)
            : state.patientDetailTab === "随访记录" ? renderPatientFollowupPanel(item)
            : renderPatientMedicationPanel(item);
          var record = '<section class="ops-patient-record-card"><div class="ops-patient-detail-tabs">' + tabs + '</div>' + timelineBody + '</section>';
          return '<section class="ops-page">' + toolbar(["首页", "患者管理", "患者档案", "患者档案详情"], "") + '<div class="ops-patient-detail-scroll">' + profile + record + '</div></section>';
        }

        function filteredOpsPatients() {
          var filter = state.opsPatientApplied;
          function includes(value, keyword) {
            return !keyword || String(value || "").toLowerCase().indexOf(String(keyword).trim().toLowerCase()) >= 0;
          }
          return opsPatients.filter(function (item) {
            if (!includes(item.name, filter.name)) return false;
            if (!includes(item.phone, filter.phone)) return false;
            if (!includes(item.diagnosis, filter.diagnosis)) return false;
            if (!includes(item.doctor, filter.doctor)) return false;
            if (!includes(item.hospital, filter.hospital)) return false;
            if (filter.archived && item.archived !== (filter.archived === "已建档")) return false;
            if (filter.medical && item.medical !== (filter.medical === "已上传")) return false;
            if (filter.project && item.project !== filter.project) return false;
            if (filter.scene && item.scene !== filter.scene) return false;
            var registeredDate = item.registered.slice(0, 10);
            if (filter.registeredStart && registeredDate < filter.registeredStart) return false;
            if (filter.registeredEnd && registeredDate > filter.registeredEnd) return false;
            return true;
          });
        }

        function renderOpsPatientRows(rows) {
          if (!rows.length) return '<tr><td colspan="14"><div class="ops-empty">暂无符合条件的患者</div></td></tr>';
          return rows.map(function (item, index) {
            return '<tr><td>' + (index + 1) + '</td><td>' + escapeHtml(item.name) + '</td><td>' + escapeHtml(item.gender) + '</td><td>' + escapeHtml(item.phone) + '</td><td>' + escapeHtml(item.diagnosis) + '</td><td>' + escapeHtml(item.hospital) + '</td><td><span class="ops-tag">' + escapeHtml(item.doctor) + '</span></td><td>' + escapeHtml(item.project) + '</td><td><span class="ops-cell-summary">' + escapeHtml(item.scene) + '</span></td><td><span class="ops-tag ' + (item.archived ? 'is-green' : 'is-gray') + '">' + (item.archived ? '已建档' : '未建档') + '</span></td><td><span class="ops-tag ' + (item.medical ? 'is-green' : 'is-gray') + '">' + (item.medical ? '已上传' : '未上传') + '</span></td><td>' + escapeHtml(item.registered) + '</td><td>' + escapeHtml(item.login) + '</td><td><button class="ops-link" type="button" data-action="ops-patient-view" data-id="' + item.id + '">查看详情</button></td></tr>';
          }).join("");
        }

        function renderOpsPatientsPage() {
          var draft = state.opsPatientDraft;
          var rows = filteredOpsPatients();
          function option(value, label, current) {
            return '<option value="' + escapeHtml(value) + '"' + (value === current ? ' selected' : '') + '>' + escapeHtml(label) + '</option>';
          }
          var filter = '<div class="ops-filter-panel ops-ops-patient-filter" aria-label="患者列表查询">' +
            '<label class="ops-field"><span class="ops-field-label">患者姓名</span><input data-bind="opsPatient.name" value="' + escapeHtml(draft.name) + '" placeholder="请输入患者姓名"></label>' +
            '<label class="ops-field"><span class="ops-field-label">手机号</span><input data-bind="opsPatient.phone" value="' + escapeHtml(draft.phone) + '" placeholder="请输入手机号"></label>' +
            '<label class="ops-field"><span class="ops-field-label">诊断</span><input data-bind="opsPatient.diagnosis" value="' + escapeHtml(draft.diagnosis) + '" placeholder="请输入诊断"></label>' +
            '<label class="ops-field ops-ops-patient-doctor-field"><span class="ops-field-label">医生姓名</span><input data-bind="opsPatient.doctor" value="' + escapeHtml(draft.doctor) + '" placeholder="请输入医生姓名"></label>' +
            '<label class="ops-field"><span class="ops-field-label">医院名称</span><input data-bind="opsPatient.hospital" value="' + escapeHtml(draft.hospital) + '" placeholder="请输入医院名称"></label>' +
            '<label class="ops-field"><span class="ops-field-label">是否建档</span><select data-bind="opsPatient.archived">' + option("", "请选择", draft.archived) + option("已建档", "已建档", draft.archived) + option("未建档", "未建档", draft.archived) + '</select></label>' +
            '<label class="ops-field ops-ops-patient-medical-field"><span class="ops-field-label">是否上传病历</span><select data-bind="opsPatient.medical">' + option("", "请选择", draft.medical) + option("已上传", "已上传", draft.medical) + option("未上传", "未上传", draft.medical) + '</select></label>' +
            '<label class="ops-field"><span class="ops-field-label">首次加入项目</span><select data-bind="opsPatient.project">' + option("", "请选择项目", draft.project) + option("糖脂减重项目", "糖脂减重项目", draft.project) + option("慢病随访项目", "慢病随访项目", draft.project) + '</select></label>' +
            '<label class="ops-field"><span class="ops-field-label">首次注册场景码</span><select data-bind="opsPatient.scene">' + option("", "请选择场景码", draft.scene) + option("糖脂减重工作流（测试）", "糖脂减重工作流（测试）", draft.scene) + option("中山一南沙院区300问诊", "中山一南沙院区300问诊", draft.scene) + '</select></label>' +
            '<div class="ops-field ops-ops-patient-register-field"><span class="ops-field-label">注册时间</span><div class="ops-message-date-range"><input type="date" data-bind="opsPatient.registeredStart" value="' + escapeHtml(draft.registeredStart) + '" aria-label="注册开始日期"><span>至</span><input type="date" data-bind="opsPatient.registeredEnd" value="' + escapeHtml(draft.registeredEnd) + '" aria-label="注册结束日期"></div></div>' +
            '<div class="ops-filter-actions ops-ops-patient-filter-actions">' + button("重置", "", "ops-patient-reset") + button("查询", "primary", "ops-patient-search") + '</div></div>';
          var table = '<section class="ops-card ops-table-panel"><div class="ops-table-scroll"><table class="ops-table ops-ops-patient-table" aria-label="运营患者列表"><thead><tr><th>序号</th><th>患者姓名</th><th>性别</th><th>联系方式</th><th>诊断信息</th><th>首次医生所属医院</th><th>首次添加医生</th><th>首次加入项目</th><th>首次注册场景码</th><th>是否建档</th><th>是否上传病历</th><th>注册时间</th><th>最新登录时间</th><th>操作</th></tr></thead><tbody>' + renderOpsPatientRows(rows) + '</tbody></table></div></section>';
          var total = rows.length;
          return '<section class="ops-page ops-list-page ops-ops-patient-page" style="grid-template-rows:auto auto minmax(0,1fr) auto">' + toolbar(["首页", "运营管理", "患者列表"], renderIconActions("导出", "ops-patient-export", "")) + filter + table + '<footer class="ops-pagination"><span>共 ' + total + ' 条数据</span><button class="ops-button" type="button" disabled>上一页</button><button class="ops-page-number" type="button" aria-current="page">1</button><button class="ops-page-number" type="button">2</button><button class="ops-page-number" type="button">3</button><button class="ops-button" type="button">下一页</button><select aria-label="每页条数"><option>15 条/页</option><option>30 条/页</option></select></footer></section>';
        }

        function parseConversationMessage(text, conversation) {
          var source = String(text);
          var senderMatch = source.match(/^([^：]{1,8})：/);
          return {
            name: senderMatch ? senderMatch[1] : (conversation.type === "群聊" ? "群成员" : conversation.name),
            text: senderMatch ? source.slice(senderMatch[0].length) : source
          };
        }

        function renderChatMessages(conversation) {
          var messages=conversation&&conversation.messageRecords||[];
          if(!messages.length)messages=conversation&&conversation.name!=="王德华"?conversation.messages.slice().reverse().map(function(text,index){var message=parseConversationMessage(text,conversation);return {side:/医生|医助/.test(message.name)?'self':'other',name:message.name,time:conversation.date+' 09:'+String(1+index*4).padStart(2,'0'),text:message.text};}).concat(state.chatConversationReplies[conversation.name]||[]):state.chatMessages;
          return messages.map(function(message){var self=message.kind?message.kind!=='patient':message.side==='self',name=message.speakerName||message.displayName||message.name||(message.kind==='ai'?'AI':message.kind==='human'?'接待人员':'患者'),time=message.displayTime||message.time||(message.sentAt?new Date(message.sentAt).toLocaleString('zh-CN',{hour12:false}):'');return '<article class="ops-message '+(self?'is-self':'')+'" data-chat-message-id="'+escapeHtml(message.id||'')+'" data-speaker-id="'+escapeHtml(message.speakerId||'')+'" tabindex="-1"><span class="ops-avatar">'+escapeHtml(self?'医':name.slice(0,1))+'</span><div class="ops-message-copy"><div class="ops-message-meta">'+escapeHtml(name)+' · '+escapeHtml(time)+'</div><div class="ops-bubble">'+escapeHtml(message.text)+'</div></div></article>';}).join('');
        }

        function chatHistoryDateIso(daysAgo) {
          var date = new Date(todayLocalIso() + "T12:00:00");
          date.setDate(date.getDate() - daysAgo);
          return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
        }

        function chatHistoryAvailableDates() {
          return Array.from(new Set(chatHistoryRecords.map(function (record) { return chatHistoryDateIso(record.daysAgo); }))).sort();
        }

        function chatHistorySenderName(record, selectedConversation) {
          if (record.role === "患者") return selectedConversation.type === "群聊" ? record.groupSender || "群成员" : selectedConversation.name;
          return record.role === "医生" ? "张医生" : "随访医助";
        }

        function chatHistoryMonthShift(month, offset) {
          var date = new Date(Number(month.slice(0, 4)), Number(month.slice(5, 7)) - 1 + offset, 1);
          return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0");
        }

        function renderChatHistoryCalendar() {
          var availableDates = chatHistoryAvailableDates();
          var firstMonth = availableDates[0].slice(0, 7);
          var lastMonth = availableDates[availableDates.length - 1].slice(0, 7);
          var month = state.chatHistoryCalendarMonth;
          if (month < firstMonth || month > lastMonth) month = state.chatHistoryCalendarMonth = lastMonth;
          var year = Number(month.slice(0, 4));
          var monthIndex = Number(month.slice(5, 7)) - 1;
          var firstWeekday = (new Date(year, monthIndex, 1).getDay() + 6) % 7;
          var daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
          var cells = [];
          for (var offset = 0; offset < firstWeekday; offset += 1) cells.push('<span aria-hidden="true"></span>');
          for (var day = 1; day <= daysInMonth; day += 1) {
            var dateIso = month + "-" + String(day).padStart(2, "0");
            var enabled = availableDates.indexOf(dateIso) >= 0;
            cells.push('<button class="' + (state.chatHistoryDate === dateIso ? 'is-selected' : '') + '" type="button" data-action="chat-history-date-select" data-value="' + dateIso + '" aria-label="' + dateIso + (enabled ? '，有聊天记录' : '，无聊天记录') + '"' + (enabled ? '' : ' disabled') + '>' + day + '</button>');
          }
          while (cells.length % 7) cells.push('<span aria-hidden="true"></span>');
          var weekdays = ["一", "二", "三", "四", "五", "六", "日"].map(function (day) { return '<span class="is-weekday">' + day + '</span>'; }).join("");
          return '<div class="ops-chat-history-calendar" data-chat-history-calendar role="dialog" aria-label="选择聊天记录日期"><div class="ops-chat-history-calendar-head"><button type="button" data-action="chat-history-month-prev" aria-label="上个月"' + (month === firstMonth ? ' disabled' : '') + '>' + icon("fa-chevron-left") + '</button><span>' + year + ' 年 ' + (monthIndex + 1) + ' 月</span><button type="button" data-action="chat-history-month-next" aria-label="下个月"' + (month === lastMonth ? ' disabled' : '') + '>' + icon("fa-chevron-right") + '</button></div><div class="ops-chat-history-calendar-grid">' + weekdays + cells.join("") + '</div><div class="ops-chat-history-calendar-foot"><button type="button" data-action="chat-history-date-clear">全部日期</button><small>仅有记录的日期可选</small></div></div>';
        }

        function highlightChatHistoryText(value, query) {
          var text = String(value || "");
          var term = String(query || "").trim();
          if (!term) return escapeHtml(text);
          var lowerText = text.toLowerCase();
          var lowerTerm = term.toLowerCase();
          var result = "";
          var cursor = 0;
          var index = lowerText.indexOf(lowerTerm, cursor);
          while (index >= 0) {
            result += escapeHtml(text.slice(cursor, index)) + '<mark class="ops-chat-history-highlight">' + escapeHtml(text.slice(index, index + term.length)) + '</mark>';
            cursor = index + term.length;
            index = lowerText.indexOf(lowerTerm, cursor);
          }
          return result + escapeHtml(text.slice(cursor));
        }

        function chatHistoryMatches(kind, sender, dateIso, text) {
          if (state.chatHistoryTab !== "全部" && state.chatHistoryTab !== kind) return false;
          if (state.chatHistorySender !== "全部" && state.chatHistorySender !== sender) return false;
          if (state.chatHistoryDate !== "全部" && state.chatHistoryDate !== dateIso) return false;
          var query = state.chatHistorySearch.trim().toLowerCase();
          return !query || sender.toLowerCase().indexOf(query) >= 0 || text.toLowerCase().indexOf(query) >= 0;
        }

        function filterChatHistory() {
          var entries = document.querySelectorAll("[data-chat-history-entry]");
          var visible = 0;
          entries.forEach(function (entry) {
            var sender = entry.getAttribute("data-history-sender") || "";
            var text = entry.getAttribute("data-history-text") || "";
            var matches = chatHistoryMatches(entry.getAttribute("data-history-kind"), sender, entry.getAttribute("data-history-date"), text);
            entry.hidden = !matches;
            if (matches) visible += 1;
            var senderLabel = entry.querySelector(".ops-chat-history-sender");
            var messageText = entry.querySelector("p");
            if (senderLabel) senderLabel.innerHTML = highlightChatHistoryText(sender, state.chatHistorySearch);
            if (messageText) messageText.innerHTML = highlightChatHistoryText(text, state.chatHistorySearch);
          });
          var empty = document.querySelector("[data-chat-history-empty]");
          if (empty) empty.hidden = visible > 0;
        }

        function renderChatHistoryPanel(selectedConversation) {
          var tabs = ["全部", "文件", "图片与视频", "链接", "小程序"].map(function (tab) {
            var active = state.chatHistoryTab === tab;
            return '<button class="' + (active ? 'is-active' : '') + '" type="button" role="tab" aria-selected="' + (active ? 'true' : 'false') + '" data-action="chat-history-tab" data-value="' + tab + '">' + tab + '</button>';
          }).join("");
          var senderNames = [];
          chatHistoryRecords.forEach(function (record) {
            var name = chatHistorySenderName(record, selectedConversation);
            if (senderNames.indexOf(name) < 0) senderNames.push(name);
          });
          if (state.chatHistorySender !== "全部" && senderNames.indexOf(state.chatHistorySender) < 0) state.chatHistorySender = "全部";
          var senderOptions = ["全部"].concat(senderNames).map(function (sender) {
            return '<option value="' + escapeHtml(sender) + '"' + (state.chatHistorySender === sender ? ' selected' : '') + '>' + escapeHtml(sender === "全部" ? "发送人" : sender) + '</option>';
          }).join("");
          var visibleCount = 0;
          var entries = chatHistoryRecords.slice().sort(function (a, b) {
            return a.daysAgo - b.daysAgo || b.time.localeCompare(a.time);
          }).map(function (record) {
            var sender = chatHistorySenderName(record, selectedConversation);
            var dateIso = chatHistoryDateIso(record.daysAgo);
            var visible = chatHistoryMatches(record.kind, sender, dateIso, record.text);
            if (visible) visibleCount += 1;
            var dateLabel = Number(dateIso.slice(5, 7)) + "/" + Number(dateIso.slice(8, 10)) + " " + record.time;
            return '<article class="ops-chat-history-entry ' + (record.role === "患者" ? "is-patient" : "") + '" data-chat-history-entry data-history-kind="' + escapeHtml(record.kind) + '" data-history-sender="' + escapeHtml(sender) + '" data-history-date="' + dateIso + '" data-history-text="' + escapeHtml(record.text) + '"' + (visible ? '' : ' hidden') + '><div class="ops-chat-history-meta"><span class="ops-chat-history-sender">' + highlightChatHistoryText(sender, state.chatHistorySearch) + '</span><time datetime="' + dateIso + 'T' + record.time + '">' + dateLabel + '</time></div><p>' + highlightChatHistoryText(record.text, state.chatHistorySearch) + '</p></article>';
          }).join("");
          var dateTrigger = '<button class="ops-chat-history-date-trigger" type="button" data-action="chat-history-date-toggle" aria-label="筛选日期" aria-haspopup="dialog" aria-expanded="' + (state.chatHistoryCalendarOpen ? "true" : "false") + '"><span>' + escapeHtml(state.chatHistoryDate === "全部" ? "日期" : state.chatHistoryDate) + '</span>' + icon("fa-chevron-down") + '</button>';
          return '<section class="ops-chat-history-panel" aria-label="聊天记录"><div class="ops-chat-history-tabs" role="tablist" aria-label="聊天记录类型">' + tabs + '</div><label class="ops-search-shell ops-chat-history-search">' + icon("fa-magnifying-glass") + '<input data-bind="chat.historySearch" value="' + escapeHtml(state.chatHistorySearch) + '" placeholder="搜索聊天记录" aria-label="搜索聊天记录"></label><div class="ops-chat-history-filters"><select data-bind="chat.historySender" aria-label="筛选发送人">' + senderOptions + '</select>' + dateTrigger + (state.chatHistoryCalendarOpen ? renderChatHistoryCalendar() : "") + '</div><div class="ops-chat-history-list" role="list">' + entries + '<div class="ops-chat-history-empty" data-chat-history-empty' + (visibleCount ? ' hidden' : '') + '>暂无匹配的聊天记录</div></div></section>';
        }

        function getChatSourceData() {
          return [
            { patientId: "patient-demo-1", name: "王德华", type: "私聊", gender: "男", age: 58, text: "好的，谢谢医生。", searchText: chatMessages.map(function (message) { return message.text; }).join(" "), messages: state.chatMessages.slice().reverse().map(function (message) { return message.name + "：" + message.text; }), date: "2026-08-24", time: "09:18", count: 2, timeoutMinutes: 5, tags: ["糖尿病", "慢病管理", "复诊提醒"] },
            { patientId: "patient-demo-2", name: "孙大伟", type: "私聊", gender: "男", age: 46, text: "血糖记录已经上传", searchText: "血糖记录已经上传，请医生查看今日空腹血糖。", messages: ["血糖记录已经上传，请医生查看今日空腹血糖。", "张医生：记录已收到，今天的数据比上周稳定，请继续按计划监测。", "医生您好，今天餐后的血糖比前几天稳定一些。"], date: "2026-08-23", time: "昨天", count: 0, nearingTimeout: true, tags: ["糖尿病", "慢病管理"] },
            { name: "慢病管理群", type: "群聊", text: "张医生：本周随访已完成", searchText: "张医生：本周随访已完成，请大家按时记录健康指标。", messages: ["张医生：本周随访已完成，请大家按时记录健康指标。", "王医助：下周随访安排已更新，请留意群通知。", "周女士：健康指标记录表我已经填写好了。"], date: "2026-08-23", time: "昨天", count: 3, tags: ["慢病管理", "群聊"] },
            { patientId: "patient-demo-3", name: "刘德华", type: "私聊", gender: "男", age: 58, text: "请问药需要饭后吃吗？", searchText: "请问药需要饭后吃吗？降压药服用时间咨询。", messages: ["请问药需要饭后吃吗？", "张医生：请按照处方注明的服药时间，不要自行调整剂量。", "昨天的降压药忘记吃了一次，今天需要补服吗？"], date: "2026-08-18", time: "周一", count: 1, tags: ["高血压", "用药提醒"] },
            { name: "糖尿病患者群", type: "群聊", text: "今日血糖打卡已开始", searchText: "今日血糖打卡已开始，请群内患者上传记录。", messages: ["王医助：今日血糖打卡已开始，请群内患者上传记录。", "张医生：血糖记录请填写测量时间和数值。", "林女士：上周的健康教育材料我已经看过了。"], date: "2026-08-18", time: "周一", count: 0, tags: ["糖尿病", "群聊"] },
            { patientId: "patient-demo-4", name: "陈建军", type: "私聊", gender: "男", age: 61, text: "我已收到复诊提醒", searchText: "我已收到复诊提醒，会按时到院复诊。", messages: ["我已收到复诊提醒，会按时到院复诊。", "王医助：请带上近期检查报告和正在服用的药物清单。", "下周复诊前需要准备哪些资料？"], date: "2026-08-20", time: "08-20", count: 0, tags: ["复诊提醒"] }
          ];
        }


        var conversationInbox=null,inboxRenderQueued=false,inboxOperationCounter=0,inboxCompositionNode=null,inboxRenderDeferred=false,inboxDrafts={},inboxSending={};
        function getChatConversationData(){return conversationInbox?conversationInbox.rows(state.chatDoctorSelected):getChatSourceData();}
        function inboxBasicDefaults(row){var known=getChatSourceData().some(function(source){return source.patientId&&source.patientId===row.patientId;});return {name:row.name,gender:row.gender||'',phone:known?'138****5605':'',birthDate:known&&row.patientId==='patient-demo-1'?'1968-06-15':'',height:'',diagnosis:known?'2型糖尿病':''};}
        function bindInboxBasic(row){if(!row||!row.inboxKey||state.chatBasicScope===row.inboxKey)return;if(state.chatBasicScope)chatPatientBasics[state.chatBasicScope]=state.chatPatientBasic;state.chatPatientBasic=chatPatientBasics[row.inboxKey]||inboxBasicDefaults(row);state.chatBasicScope=row.inboxKey;}
        function bindInboxDraft(c,subject){var key=c?c.key+'|'+(subject?subject.id:'readonly'):null;if(state.chatDraftScope===key)return;if(state.chatDraftScope)inboxDrafts[state.chatDraftScope]=state.chatDraft;state.chatDraftScope=key;state.chatDraft=key&&inboxDrafts[key]||'';}
        function chatInboxConversation(row,doctor){return conversationInbox&&conversationInbox.find(row,doctor||state.chatDoctorSelected);}
        function selectedChatConversation(){var rows=getChatConversationData();return state.chatConversationSelectedKey?rows.find(function(item){return item.inboxKey===state.chatConversationSelectedKey;}):rows.find(function(item){return item.name===state.chatSelected;});}
        function chatInboxSelected(){var row=selectedChatConversation(),c=chatInboxConversation(row);return c||null;}
        function chatInboxProjection(queue,doctor){
          if(!conversationInbox)return {rows:[],counts:{human:0,ai:0,all:0}};
          var account=conversationInbox.account(doctor||state.chatDoctorSelected);if(!account)return {rows:[],counts:{human:0,ai:0,all:0}};
          return conversationInbox.store.project({tenantId:'tenant-demo',projectId:account.projectId,accountId:account.id,queue:queue||state.chatWorkQueue});
        }
        function chatInboxRows(queue,doctor){var sources=conversationInbox?conversationInbox.rows(doctor||state.chatDoctorSelected):[],byKey={};sources.forEach(function(row){byKey[row.inboxKey]=row;});return chatInboxProjection(queue,doctor).rows.map(function(view){return byKey[view.key]?Object.assign({},byKey[view.key],{inboxView:view}):null;}).filter(Boolean);}
        function chatInboxFiltered(queue,doctor,includeType){
          var sources=conversationInbox?conversationInbox.rows(doctor||state.chatDoctorSelected):[],projection=chatInboxProjection(queue,doctor),byKey={};sources.forEach(function(row){byKey[row.inboxKey]=row;});
          var keyword=String(state.chatConversationSearch||'').trim().toLowerCase();
          return projection.rows.map(function(view){var row=byKey[view.key];return row?Object.assign({},row,{inboxView:view}):null;}).filter(Boolean).filter(function(row){return queryChatConversations([row],state.chatQueryApplied).length&&(!includeType||state.chatConversationTab==='全部'||row.type===state.chatConversationTab)&&(!keyword||row.name.toLowerCase().indexOf(keyword)>=0||conversationContentMatches(row,keyword).length>0);});
        }
        function chatInboxProjectCount(projectName){if(!conversationInbox)return 0;var keys=new Set();conversationInbox.accounts.filter(function(a){return a.project===projectName;}).forEach(function(a){chatInboxFiltered('human',a.name,true).forEach(function(row){keys.add(row.inboxKey);});});return keys.size;}
        function chatInboxSubject(){
          var c=chatInboxSelected();if(!c)return null;
          var subjects=conversationInbox.store.listSubjects({conversationKey:c.key}).filter(function(s){return s.status!=='done';}),selected=subjects.find(function(s){return s.id===state.chatSubjectSelected;});
          if(!selected)selected=subjects.find(function(s){return s.status==='active'&&conversationInbox.store.canOperate(s.id,{action:'complete'});})||subjects.find(function(s){return conversationInbox.store.canOperate(s.id,{action:'claim'});})||subjects[0];
          state.chatSubjectSelected=selected?selected.id:null;return selected||null;
        }
        function chatInboxIsHistory(){return state.chatReadOnlyContext===chatOutboxScope(getHandoffContext());}
        function chatInboxCanOperate(){
          if(!conversationInbox||chatInboxIsHistory()||!conversationInbox.store.refresh().ok)return false;
          var c=chatInboxSelected(),s=chatInboxSubject();if(!c||!s||!conversationInbox.store.canOperate(s.id,{action:'complete'}))return false;
          return true;
        }
        function chatInboxChange(){if(inboxRenderQueued)return;inboxRenderQueued=true;window.requestAnimationFrame(function(){inboxRenderQueued=false;if(shell&&currentRoute()==='aggregate-chat')render({preserveArchiveScroll:true,preserveChatScroll:true,preserveChatInput:true});});}
        function chatInboxWaitText(at){var seconds=Math.max(0,Math.floor((Date.now()-at)/1000));return seconds<60?'等待不足1分':seconds<3600?'等待'+Math.floor(seconds/60)+'分':'等待'+Math.floor(seconds/3600)+'时'+Math.floor(seconds%3600/60)+'分';}
        function chatInboxState(view){if(view.humanSubjectCount)return '待人工';if(view.waitingPatientCount)return '等待患者';if(view.queue==='ai')return 'AI 接待';var other=conversationInbox.store.listSubjects({conversationKey:view.key}).find(function(s){return s.status!=='done'&&s.assignee&&s.assignee.kind!=='ai';});return other?(other.assignee.name||'其他人员')+'接待':'无待人工事项';}
        function chatInboxSpeaker(c,id){var m=conversationInbox.store.listMessages(c.key).find(function(item){return item.speakerId===id;});return m&&(m.speakerName||m.displayName)||c.patientName||(c.kind==='group'?'群成员':c.title);}
        function chatInboxRowSummary(item){
          var v=item.inboxView;if(!v)return escapeHtml(item.text||'');var s=v.summary;
          if(s)return '<span data-inbox-summary title="'+escapeHtml(s.text)+'">'+escapeHtml((item.type==='群聊'?chatInboxSpeaker(v.conversation,s.speakerId)+'：':'')+s.text)+'</span>';
          return escapeHtml(v.lastMessage&&v.lastMessage.text||item.text||'');
        }
        function renderChatInboxTabs(){return '<div class="ops-inbox-queues" role="tablist" aria-label="接待队列">'+[['human','待人工'],['ai','AI接待'],['all','全部']].map(function(q){return '<button type="button" role="tab" data-action="inbox-queue" data-inbox-queue="'+q[0]+'" aria-selected="'+(state.chatWorkQueue===q[0])+'" class="'+(state.chatWorkQueue===q[0]?'is-active':'')+'">'+q[1]+' <span data-inbox-queue-count="'+q[0]+'">'+chatInboxFiltered(q[0],null,true).length+'</span></button>';}).join('')+'</div>';}
        function renderChatInboxMatters(c){
          if(!conversationInbox||!c)return '';
          var current=chatInboxSubject(),subjects=conversationInbox.store.listSubjects({conversationKey:c.key}).filter(function(s){return s.status!=='done';});
          if(!subjects.length)return '<div class="ops-inbox-view-state">'+(c.aiService&&c.aiService.receiving?'AI 接待':'只读会话')+'</div>';
          return '<div class="ops-inbox-matters" aria-label="人工处理事项">'+subjects.map(function(s){
            var own=conversationInbox.store.canOperate(s.id,{action:'complete'})&&!chatInboxIsHistory(),claim=conversationInbox.store.canOperate(s.id,{action:'claim'})&&!chatInboxIsHistory(),speaker=chatInboxSpeaker(c,s.speakerId);
            var active=current&&current.id===s.id,actions='';
            if(own)actions='<button type="button" class="ops-link" data-action="inbox-wait-patient" '+(s.status==='waiting_patient'?'disabled':'')+'>等待患者</button><button type="button" class="ops-link" data-action="inbox-complete">完成事项</button>';
            else if(claim)actions='<button type="button" class="ops-link" data-action="inbox-claim">领取事项</button>';
            return '<section class="ops-inbox-matter '+(active?'is-active':'')+'" data-inbox-matter-id="'+escapeHtml(s.id)+'" data-inbox-revision="'+s.revision+'" data-inbox-cutoff="'+s.lastPatientSeq+'"><div class="ops-inbox-matter-heading"><button type="button" class="ops-link" data-action="inbox-select-subject" aria-pressed="'+active+'">'+escapeHtml(speaker)+' · '+(s.status==='waiting_patient'?'等待患者':'待人工')+'</button><small>'+escapeHtml(s.assignee?s.assignee.name||'接待人员':'待领取')+'</small></div><p>'+escapeHtml(s.requestText)+'</p><div class="ops-inbox-matter-actions">'+(s.originMessageId?'<button type="button" class="ops-link" data-action="inbox-origin">定位原消息</button>':'<small>转出说明 · 原消息未留存</small>')+'<span></span>'+actions+'</div></section>';
          }).join('')+'</div>';
        }
        function chatInboxCommand(target){var el=target.closest('[data-inbox-matter-id]');if(!el)return null;var subject=conversationInbox.store.getSubject(el.getAttribute('data-inbox-matter-id'));return subject?{subject:subject,command:{expectedRevision:Number(el.getAttribute('data-inbox-revision')),throughPatientSeq:Number(el.getAttribute('data-inbox-cutoff'))}}:null;}
        function chatInboxBeginTransfer(to,subject,request){
          if(!conversationInbox||!subject)return {ok:false,code:'subject_required'};
          return conversationInbox.store.beginOperation({id:'inbox-route-'+request+'-'+(++inboxOperationCounter),requestId:request,attemptId:'attempt-'+inboxOperationCounter,subjectId:subject.id,kind:'transfer',expectedRevision:subject.revision,throughPatientSeq:subject.lastPatientSeq,to:to});
        }
        function chatInboxSettle(op,result){if(!op||!op.operation)return;return conversationInbox.store.settleOperation({id:op.operation.id,requestId:op.operation.requestId,attemptId:op.operation.attemptId,success:!!result.ok,receiptId:'receipt-'+op.operation.id,error:result.message||result.code});}

        function conversationContentMatches(item, keyword) {
          if (!keyword) return [];
          var sentMessages = (state.chatConversationReplies[item.name] || []).slice().reverse().map(function (message) { return message.text; });
          var messages = (item.messages || [item.searchText || item.text]).map(function (message) {
            return item.name === "王德华" ? String(message) : parseConversationMessage(message, item).text;
          });
          return sentMessages.concat(messages).filter(function (message) {
            return String(message).toLowerCase().indexOf(keyword) >= 0;
          });
        }

        function renderConversationMatchText(message, keyword) {
          var text = String(message || "");
          var index = text.toLowerCase().indexOf(keyword);
          var start = Math.max(0, index - 14);
          var end = Math.min(text.length, Math.max(start + 48, index + keyword.length + 16));
          var excerpt = (start ? "…" : "") + text.slice(start, end) + (end < text.length ? "…" : "");
          var lowerExcerpt = excerpt.toLowerCase();
          var result = "";
          var cursor = 0;
          var found = lowerExcerpt.indexOf(keyword);
          while (found >= 0) {
            result += escapeHtml(excerpt.slice(cursor, found)) + '<mark class="ops-conversation-match">' + escapeHtml(excerpt.slice(found, found + keyword.length)) + '</mark>';
            cursor = found + keyword.length;
            found = lowerExcerpt.indexOf(keyword, cursor);
          }
          return result + escapeHtml(excerpt.slice(cursor));
        }

        function countMatchedConversations(items, keyword) {
          if (!keyword) return 0;
          return items.filter(function (item) {
            return item.name.toLowerCase().indexOf(keyword) < 0 && conversationContentMatches(item, keyword).length > 0;
          }).length;
        }

        function conversationResultCountOnly(item, contentMatches, multipleMatchingConversations) {
          return multipleMatchingConversations || (item.type === "私聊" && contentMatches.length > 1);
        }

        function renderConversationSummary(item, keyword, contentMatches, countOnly) {
          if (!keyword || item.name.toLowerCase().indexOf(keyword) >= 0 || !contentMatches.length) return escapeHtml(item.text);
          var relatedCount = contentMatches.length;
          if (conversationResultCountOnly(item, contentMatches, countOnly)) return '<span class="ops-conversation-result-count">' + relatedCount + ' 条相关聊天记录</span>';
          var matchCount = '<span class="ops-conversation-result-count">' + relatedCount + ' 条相关聊天记录</span>';
          return matchCount + '<span class="ops-conversation-result-preview">' + renderConversationMatchText(contentMatches[0], keyword) + '</span>';
        }

        function queryChatConversations(rows, query) {
          var name = String(query.name || "").trim().toLowerCase();
          var content = String(query.content || "").trim().toLowerCase();
          var startDate = query.startDate || "";
          var endDate = query.endDate || "";
          return rows.filter(function (item) {
            var nameMatches = !name || item.name.toLowerCase().indexOf(name) >= 0;
            var contentMatches = !content || String(item.searchText || item.text).toLowerCase().indexOf(content) >= 0;
            var startMatches = !startDate || item.date >= startDate;
            var endMatches = !endDate || item.date <= endDate;
            return nameMatches && contentMatches && startMatches && endMatches;
          });
        }

        function runChatQuery() {
          var query = state.chatQueryDraft;
          if (query.startDate && query.endDate && query.startDate > query.endDate) {
            toast("开始日期不能晚于结束日期");
            return;
          }
          state.chatQueryApplied = {
            name: query.name,
            content: query.content,
            startDate: query.startDate,
            endDate: query.endDate
          };
          var matches = queryChatConversations(getChatConversationData(), state.chatQueryApplied);
          var selectedVisible = matches.some(function (item) { return item.name === state.chatSelected; });
          if (!selectedVisible && matches.length) state.chatSelected = matches[0].name;
          toast("查询完成，共 " + matches.length + " 条会话");
        }

        function resetChatQuery() {
          state.chatQueryDraft = { name: "", content: "", startDate: "2025-09-10", endDate: "2026-09-10" };
          state.chatQueryApplied = { name: "", content: "", startDate: "2025-09-10", endDate: "2026-09-10" };
          toast("查询条件已重置");
        }

        function renderChatMaterialVisual(item) {
          var type = item.type;
          var image = type === "图片" ? (item.thumbnail || "patient-profile-assets/profile-avatar.png") : type === "小程序" ? item.miniIconUrl : type === "视频" ? item.thumbnail : "";
          if (image) return '<span class="ops-material-visual is-thumbnail"><img src="' + escapeHtml(image) + '" alt="">' + (type === "视频" ? '<span class="ops-material-play-mark" aria-hidden="true">▶</span>' : '') + '</span>';
          var shapes = {
            "文本": '<path d="M5 5h10M5 10h14M5 15h10M5 20h14"/>',
            "网页": '<path d="m10 14 4-4m-6 6-1 1a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0m2 0 1-1a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0" transform="translate(1 0)"/>',
            "文件": '<path d="M6 2h8l5 5v15H6z" fill="currentColor" stroke="none"/><path d="M14 2v6h5" stroke="white"/>',
            "语音": '<circle cx="12" cy="12" r="12" fill="currentColor" stroke="none"/><g stroke="white"><rect x="9" y="5" width="6" height="10" rx="3"/><path d="M7 11v1a5 5 0 0 0 10 0v-1m-5 6v3m-3 0h6"/></g>',
            "视频": '<circle cx="12" cy="12" r="12" fill="currentColor" stroke="none"/><path d="m10 7 7 5-7 5z" fill="white" stroke="none"/>',
            "小程序": '<rect x="3" y="3" width="18" height="18" rx="5"/><path d="M8 10a3 3 0 1 1 3 3m5 1a3 3 0 1 1-3-3"/>'
          };
          var shape = shapes[type === "音频" ? "语音" : type] || shapes["文件"];
          return '<span class="ops-material-visual" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + shape + '</svg></span>';
        }

        function renderChatMaterialRow(item) {
          var content = item.content || item.summary || "";
          var isText = item.type === "文本";
          var isFile = ["图片", "视频", "语音", "音频", "文件"].indexOf(item.type) >= 0;
          var title = item.name || "未命名素材";
          var detail = isText ? (item.content || item.summary || "") : isFile ? (item.uploadName || item.content || item.summary || "") : item.type === "网页" ? (item.webTitle || item.summary || "") : (item.miniTitle || item.summary || "");
          var secondary = isFile ? (item.metadata || "") : item.type === "网页" ? (item.content || "") : item.type === "小程序" ? (item.path || item.content || "") : "";
          if(secondary === detail)secondary="";
          var attributes = ' data-value="' + escapeHtml(content) + '" data-chat-material-id="' + escapeHtml(item.id) + '" data-chat-material-type="' + escapeHtml(item.type) + '" data-chat-material-name="' + escapeHtml(item.name) + '"';
          var personal = state.chatMaterialScope === "个人素材";
          var management = personal ? '<div class="qr-personal-actions"><button type="button" class="ops-link" data-action="chat-material-pin" aria-pressed="'+(item.pinned?'true':'false')+'"'+attributes+'>'+icon("fa-thumbtack")+(item.pinned?'取消置顶':'置顶')+'</button><button type="button" class="ops-link qr-material-delete" data-action="chat-material-delete"'+attributes+'>'+icon("fa-trash")+'删除</button></div>' : '';
          var pinBadge = personal && item.pinned ? '<span class="qr-pinned-badge" aria-label="已置顶">'+icon("fa-thumbtack")+'</span>' : '';
          var heading = '<span class="qr-card-heading"><span class="ops-material-row-title">'+pinBadge+escapeHtml(title)+'</span><span class="qr-group-tag">'+escapeHtml(item.group || '未分组')+'</span></span>';
          var body = '<span class="ops-material-row-copy">'  + (detail ? '<span class="ops-material-row-meta ' + (isFile ? 'is-file-name' : '') + '">' + escapeHtml(detail) + '</span>' : '') + (secondary ? '<span class="ops-material-row-meta qr-material-secondary '+(item.type === "网页" ? 'is-url' : '')+'">'+escapeHtml(secondary)+'</span>' : '') + '</span>';
          return '<article class="ops-material-snippet" data-material-kind="' + escapeHtml(item.type) + '" data-chat-material-group="' + escapeHtml(item.group) + '" data-chat-material-name="' + escapeHtml(item.name) + '" data-material-id="'+escapeHtml(item.id)+'"><button type="button" class="ops-material-open" data-action="chat-material-preview" aria-label="预览' + escapeHtml(item.name) + '"' + attributes + '>' + heading + '<span class="qr-summary-row">' + renderChatMaterialVisual(item) + body + '</span></button><div class="qr-card-footer">'+management+'<div class="ops-material-actions"><button type="button" class="ops-link" data-action="chat-material-preview"' + attributes + '>预览</button><button type="button" class="ops-link" data-action="chat-material-send"' + attributes + '>发送</button></div></div></article>';
        }

        function renderChatMaterialPreview(modal) {
          var item = findMaterialById(modal.materialId) || { name:modal.name, type:modal.typeName, content:modal.content };
          var type = item.type || modal.typeName;
          var content = modal.content || "";
          var attachment = ["图片", "视频", "语音", "音频", "文件"].indexOf(type) >= 0;
          var title = attachment ? (item.content || item.name) : item.name;
          var heading = '<header class="ops-material-preview-heading">' + renderChatMaterialVisual(item) + '<div><strong>' + escapeHtml(title) + '</strong><span>' + escapeHtml(item.metadata || type) + '</span></div></header>';
          var preview = "", editor = "";
          if (type === "图片") {
            preview = '<figure class="ops-material-image-view"><img src="' + escapeHtml(item.thumbnail || "patient-profile-assets/profile-avatar.png") + '" alt="' + escapeHtml(item.name) + '"><figcaption>' + escapeHtml(item.metadata || "图片素材") + '</figcaption></figure>';
          } else if (type === "视频") {
            if (item.mediaUrl) {
              preview = '<video class="ops-material-video-player" controls preload="metadata" src="' + escapeHtml(item.mediaUrl) + '"' + (item.thumbnail ? ' poster="' + escapeHtml(item.thumbnail) + '"' : '') + '></video>';
            } else {
              var videoMeta = item.metadata || "MP4 · 03:12 · 24.8 MB";
              var videoDurationMatch = String(videoMeta).match(/(\d{1,2}:\d{2})/);
              var videoDuration = videoDurationMatch ? videoDurationMatch[1] : "03:12";
              preview = '<div class="ops-material-video-preview" data-video-prototype data-video-duration="' + escapeHtml(videoDuration) + '"><button type="button" class="ops-material-video-toggle" data-action="material-preview-video-toggle" aria-label="播放视频" aria-pressed="false"><span class="ops-material-video-play-icon" aria-hidden="true">▶</span></button><div class="ops-material-video-meta"><strong>播放视频</strong><span>' + escapeHtml(videoMeta) + '</span><div class="ops-material-video-progress" aria-hidden="true"><span></span></div></div><time data-video-state>00:00</time></div>';
            }
          } else if (type === "语音" || type === "音频") {
            if (item.mediaUrl) {
              preview = '<audio class="ops-material-audio-player" controls preload="metadata" src="' + escapeHtml(item.mediaUrl) + '"></audio>';
            } else {
              var audioMeta = item.metadata || "MP3 · 00:36 · 576 KB";
              var audioDurationMatch = String(audioMeta).match(/(\d{1,2}:\d{2})/);
              var audioDuration = audioDurationMatch ? audioDurationMatch[1] : "00:36";
              preview = '<div class="ops-material-audio-preview" data-audio-prototype data-audio-duration="' + escapeHtml(audioDuration) + '"><button type="button" class="ops-material-audio-toggle" data-action="material-preview-audio-toggle" aria-label="播放音频" aria-pressed="false"><span aria-hidden="true">▶</span></button><div class="ops-material-audio-track"><div class="ops-material-audio-meta"><strong>播放音频</strong><span>' + escapeHtml(audioMeta) + '</span></div><div class="ops-material-audio-progress" aria-hidden="true"><span></span></div></div><time data-audio-state>00:00</time></div>';
            }
          } else if (type === "文件") {
            preview = item.mediaUrl ? '<a class="ops-link" href="'+escapeHtml(item.mediaUrl)+'" download="'+escapeHtml(item.uploadName||item.content)+'">下载文件</a>' : '<p class="ops-material-preview-hint">此处展示文件信息，当前示例未提供文件正文。</p>';
          } else if (type === "网页") {
            preview = '<p class="ops-material-web-description">' + escapeHtml(item.summary || "网页素材") + '</p>';
          }
          if (attachment) {
            editor = '<input type="hidden" data-modal="material-content" value="' + escapeHtml(content) + '">';
          } else if (type === "文本") {
            editor = '<label class="ops-material-editor-label">文本内容<textarea data-modal="material-content" rows="6">' + escapeHtml(content) + '</textarea></label>';
          } else {
            editor = '<label class="ops-material-editor-label">' + (type === "网页" ? "网页链接" : "小程序路径") + '<input data-modal="material-content" value="' + escapeHtml(content) + '"></label>';
          }
          return '<div class="ops-material-preview" data-preview-kind="' + escapeHtml(type) + '">' + heading + preview + editor + '</div>';
        }

        // Both hosts mount this complete page; only the embedded host omits navigation.
        function renderPatientArchivePage(conversation, embedded) {
          var ctx = window.ChatPatientArchive.context(conversation, state.chatDoctorSelected, state.chatArchiveScene);
          if (conversation && !ctx.group && state.chatPatientTags[conversation.name]) ctx.tags = state.chatPatientTags[conversation.name].slice();
          ctx.patientDiagnosis = state.chatPatientBasic && state.chatPatientBasic.diagnosis || '';
          ctx.patientBirthDate = state.chatPatientBasic && state.chatPatientBasic.birthDate || '';
          var spacer = '<span class="cp-navigation-spacer" aria-hidden="true"></span>';
          var navigation = embedded ? '' : '<nav class="cp-page-navigation" aria-label="患者档案页面导航">' + spacer + '<strong>患者档案</strong><button type="button" data-action="chat-archive-page-close" aria-label="关闭患者档案页面">关闭 ×</button></nav>';
          var hint = !embedded && archiveNavigationHint ? '<p class="cp-navigation-hint" role="status">' + escapeHtml(archiveNavigationHint) + '</p>' : '';
          var contentOverride;
          if(state.chatArchiveFileOriginal){
            var originalEvent=window.ChatPatientArchive.findTimelineEvent(ctx,state.chatArchiveFileOriginal.eventIndex),originalFile=originalEvent&&originalEvent.files&&originalEvent.files[state.chatArchiveFileOriginal.fileIndex];
            contentOverride=window.ChatPatientArchive.renderFileOriginal(originalEvent,originalFile,state.chatArchiveFileOriginal.eventIndex,state.chatArchiveFileOriginal.fileIndex,'chat-archive');
          }else if(state.chatArchiveEditMode!==null){
            var editEvent=window.ChatPatientArchive.findTimelineEvent(ctx,state.chatArchiveEditMode);
            contentOverride=window.ChatPatientArchive.renderTimelineEdit(editEvent,state.chatArchiveEditMode,'chat-archive');
          }
          return '<section class="ops-profile-page' + (embedded ? ' is-embedded' : '') + '">' + navigation + hint + window.ChatPatientArchive.render(ctx, state.chatArchiveTab, state.chatArchiveMetric, true, state.chatArchiveTabsExpanded, state.chatPatientPhoneVisible, state.chatPatientBasic, state.chatArchiveTimelineDetail, 'chat-archive', contentOverride) + '</section>';
        }
        function renderWorkbenchStandaloneTabs(activeTarget) {
          return '<nav class="qr-workbench-tabs" aria-label="会话工作台导航">' + [
            {label:"患者档案", target:"patient-profile"},
            {label:"AI小结", target:"ai-summary"},
            {label:"快捷回复", target:"quick-replies"},
            {label:"患者跟进", target:"patient-followups"},
            {label:"患者交接", target:"handoff"}
          ].map(function (tab) {
            return '<button type="button" class="' + (tab.target === activeTarget ? "is-active" : "") + '" data-action="quick-replies-tab-nav" data-value="' + tab.target + '" aria-current="' + (tab.target === activeTarget ? "page" : "false") + '">' + tab.label + '</button>';
          }).join("") + '</nav>';
        }
        function renderPatientAiSummaryPage(conversation, embedded) {
          var ctx = window.ChatPatientArchive.context(conversation, state.chatDoctorSelected, state.chatArchiveScene);
          if (conversation && !ctx.group && state.chatPatientTags[conversation.name]) ctx.tags = state.chatPatientTags[conversation.name].slice();
          ctx.patientDiagnosis = state.chatPatientBasic && state.chatPatientBasic.diagnosis || '';
          ctx.patientBirthDate = state.chatPatientBasic && state.chatPatientBasic.birthDate || '';
          var resolved = window.ChatPatientArchive.resolve(ctx);
          var body = resolved.record && window.PatientAiSummary ? window.PatientAiSummary.render(ctx, resolved.record) : '<div class="cp-ai-summary-empty"><strong>' + escapeHtml(resolved.reason || 'AI小结暂不可用') + '</strong><p>' + escapeHtml(resolved.hint || '当前暂无可用于整理的患者档案。') + '</p></div>';
          return '<section class="ops-ai-summary-page' + (embedded ? ' is-embedded' : '') + '" aria-label="AI小结">' + (embedded ? '' : renderWorkbenchStandaloneTabs('ai-summary')) + '<div class="cp-panel cp-ai-summary-page-panel">' + body + '</div></section>';
        }
        function currentChatArchiveAiContext() {
          var conversation = selectedChatConversation();
          var context = window.ChatPatientArchive.context(conversation, state.chatDoctorSelected, state.chatArchiveScene);
          context.patientDiagnosis = state.chatPatientBasic && state.chatPatientBasic.diagnosis || '';
          context.patientBirthDate = state.chatPatientBasic && state.chatPatientBasic.birthDate || '';
          var resolved = window.ChatPatientArchive.resolve(context);
          return { conversation: conversation, context: context, record: resolved.record || null };
        }
        function generateChatAiSummary(trigger) {
          var current = currentChatArchiveAiContext();
          var request = window.PatientAiSummary.start(current.context, current.record, Date.now(), trigger || 'manual');
          if (!request.ok) {
            if (request.reason === 'rate' && trigger !== 'auto') toast('智能体每分钟只能调用一次，请稍后再试');
            else if (request.reason === 'loading' && trigger !== 'auto') toast('智能体正在整理，请稍候');
            else if (request.reason === 'empty' && trigger !== 'auto') toast('近50条对话暂无可用记录，无法生成小结');
            return;
          }
          render({ preserveArchiveScroll: true });
          var finish = function (agentOutput) {
            window.PatientAiSummary.complete(current.context, current.record, Date.now(), request.requestId, agentOutput);
            var active = currentChatArchiveAiContext();
            if (window.PatientAiSummary.contextKey(active.context) === window.PatientAiSummary.contextKey(current.context)) render({ preserveArchiveScroll: true });
          };
          var failExternal = function (error) {
            window.PatientAiSummary.fail(current.context, current.record, error && error.message || '智能体调用失败，请稍后重试。');
            var active = currentChatArchiveAiContext();
            if (window.PatientAiSummary.contextKey(active.context) === window.PatientAiSummary.contextKey(current.context)) render({ preserveArchiveScroll: true });
          };
          var externalResult = null;
          try {
            externalResult = window.PatientAiSummary.invoke && window.PatientAiSummary.invoke(request.request);
          } catch (error) {
            failExternal(error);
            return;
          }
          var finishExternal = function (agentOutput) {
            if (!window.PatientAiSummary.validateOutput(agentOutput)) {
              failExternal(new Error('智能体返回不符合 patient_summary_v1 Schema'));
              return;
            }
            finish(agentOutput);
          };
          if (externalResult && typeof externalResult.then === 'function') {
            externalResult.then(finishExternal).catch(failExternal);
          } else if (externalResult) {
            finishExternal(externalResult);
          } else {
            // The prototype has no network endpoint. Keep a short local adapter
            // delay so the loading state and the injected agent contract are testable.
            window.setTimeout(function () { finish(); }, 520);
          }
        }
        function maybeAutoGenerateChatAiSummary() {
          if (!window.PatientAiSummary || (state.chatWorkbenchTab !== "AI小结" && !aiSummaryStandalone)) return;
          var current = currentChatArchiveAiContext();
          var key = window.PatientAiSummary.contextKey(current.context);
          if (!key || state.chatAiAutoStartedKey === key) return;
          var snapshot = window.PatientAiSummary.get(current.context, current.record);
          if (!snapshot.state.sources || !snapshot.state.sources.hasData || snapshot.state.status !== 'idle') return;
          state.chatAiAutoStartedKey = key;
          generateChatAiSummary('auto');
        }
        // Match the host header's synthetic tenant catalog; standalone entries use its first item.
        var quickReplyTenants = [{"id": "guangde", "name": "卓睦医疗科技有限公司"}, {"id": "demo-b", "name": "卓睦健康管理有限公司"}, {"id": "tenant-3", "name": "卓睦数字健康研究院"}, {"id": "tenant-4", "name": "卓睦医疗（上海）有限公司"}, {"id": "tenant-5", "name": "卓睦生物科技有限公司"}];
        var quickReplyTenantContextKey = null;
        function syncQuickReplyTenantContext() {
          var incoming = quickRepliesStandalone ? (archivePageParams.get("tenantId") || archivePageParams.get("tenant") || "") : ((window.quickReplyHostTenant || {}).name || "");
          if(incoming === quickReplyTenantContextKey)return;
          quickReplyTenantContextKey=incoming;
          var tenant=quickReplyTenants.find(function(item){return item.id===incoming || item.name===incoming;}) || quickReplyTenants[0];
          state.chatMaterialTenant=tenant.id;
          state.chatMaterialSearch="";state.chatMaterialGroup="全部素材";state.chatMaterialType="全部类型";
        }
        window.addEventListener("quick-reply-host-tenant-changed",function(){
          if(quickRepliesStandalone)return;
          syncQuickReplyTenantContext();
          if(shell && shell.querySelector('.ops-quick-reply-page'))render();
        });
        function quickReplyTypeCounts(value) {
          var keyword=String(value||"").trim().toLowerCase(),counts={"全部类型":0};
          quickReplySource().forEach(function(item){
            if(state.chatMaterialGroup!=="全部素材" && item.group!==state.chatMaterialGroup)return;
            if(keyword && item.name.toLowerCase().indexOf(keyword)<0)return;
            counts["全部类型"]++;counts[item.type]=(counts[item.type]||0)+1;
          });
          return counts;
        }
        function quickReplyTypeLabel(type,counts) { return (type==="全部类型"?"全部":type)+"（"+(counts[type]||0)+"）"; }
        function quickReplySource() {
          return (materials[state.chatMaterialScope] || []).filter(function(item){return !item.quickReplyHidden && item.purpose.indexOf("会话")>=0 && (state.chatMaterialScope !== "租户素材" || (item.tenantId || "guangde") === state.chatMaterialTenant);}).map(function(item){return item.group === "患者随访" ? Object.assign({},item,{group:/复诊/.test(item.name)?"复诊提醒":"随访关怀"}) : item;});
        }
        function renderQuickReplyPage(embedded) {
          syncQuickReplyTenantContext();
          var source = quickReplySource();
          var personal = state.chatMaterialScope === "个人素材";
          if(personal) source.sort(function(a,b){return Number(!!b.pinned)-Number(!!a.pinned) || (b.quickReplyPinOrder||0)-(a.quickReplyPinOrder||0);});
          var groups = Array.from(new Set(source.map(function(item){return item.group;})));
          if(state.chatMaterialGroup !== "全部素材" && groups.indexOf(state.chatMaterialGroup)<0) groups.push(state.chatMaterialGroup);
          var tenantSelect = state.chatMaterialScope === "租户素材" ? '<label class="qr-tenant-filter"><span>租户</span><select data-change-action="chat-material-tenant" aria-label="切换租户">'+quickReplyTenants.map(function(tenant){return '<option value="'+tenant.id+'" '+(state.chatMaterialTenant===tenant.id?'selected':'')+'>'+escapeHtml(tenant.name)+'</option>';}).join('')+'</select></label>' : '';
          var search = '<div class="ops-material-search-row"><label class="ops-search-shell ops-workbench-search">'+icon("fa-magnifying-glass")+'<input id="ops-chat-material-search" data-bind="chat.materialSearch" value="'+escapeHtml(state.chatMaterialSearch)+'" placeholder="请输入素材名称" aria-label="搜索素材"></label></div>';
          var groupSelect = '<label class="qr-folder-filter">'+icon("fa-folder")+'<select data-change-action="chat-material-group" aria-label="分组筛选"><option value="全部素材">全部分组</option>'+groups.map(function(group){return '<option value="'+escapeHtml(group)+'" '+(state.chatMaterialGroup===group?'selected':'')+'>'+escapeHtml(group)+'</option>';}).join('')+'</select></label>';
          var typeCounts=quickReplyTypeCounts(state.chatMaterialSearch);
          var typeSelect = '<select data-change-action="chat-material-type" aria-label="素材类型筛选">'+["全部类型","文本","图片","网页","视频","语音","文件","小程序"].map(function(type){return '<option value="'+type+'" '+(state.chatMaterialType===type?'selected':'')+'>'+quickReplyTypeLabel(type,typeCounts)+'</option>';}).join('')+'</select>';
          var filtered=source.filter(function(item){return (state.chatMaterialGroup==="全部素材"||item.group===state.chatMaterialGroup)&&(state.chatMaterialType==="全部类型"||item.type===state.chatMaterialType);});
          var folders=filtered.map(renderChatMaterialRow).join('');
          var tabs='<div class="ops-workbench-subtabs cp-material-tabs" role="tablist" aria-label="素材范围">'+["个人素材","租户素材","平台素材"].map(function(scope){return '<button type="button" role="tab" aria-selected="'+(state.chatMaterialScope===scope)+'" class="'+(state.chatMaterialScope===scope?'is-active':'')+'" data-action="chat-material-scope" data-value="'+scope+'">'+scope.replace('素材','')+'</button>';}).join('')+'</div>';
          var footer=personal?'<div class="qr-create-row qr-create-footer"><button class="qr-material-new" type="button" data-action="chat-material-new">'+icon("fa-plus")+'新增</button></div>':'';
          var feedback=quickRepliesStandalone&&quickReplySendStatus?'<p class="qr-send-status" role="status">'+escapeHtml(quickReplySendStatus)+'</p>':'';
          return '<section class="ops-quick-reply-page ops-chat-workbench'+(embedded?' is-embedded':'')+'" aria-label="快捷回复">'+(!embedded?renderWorkbenchStandaloneTabs('quick-replies'):'')+'<div class="qr-scope-row">'+tabs+'</div><div class="qr-content">'+feedback+'<div class="qr-filter-area">'+tenantSelect+search+'<div class="qr-filter-row">'+groupSelect+typeSelect+'</div></div><div class="qr-folder-list">'+folders+'<div class="ops-workbench-empty" data-chat-material-empty hidden>暂无匹配的素材</div></div></div>'+footer+'</section>';
        }
        var handoffRequestSequence = 0;
        // Sender-list projection only. The reception ledger, recipient queue and
        // patient/archive source remain intact after a successful dispatch.
        var chatOutboxKey = 'zmn.prototype.chat-outbox.v1';
        var chatOutbox = readChatOutbox();
        function readChatOutbox() {
          try {
            var value = JSON.parse(window.localStorage.getItem(chatOutboxKey) || 'null');
            if (value && value.version === 1 && Array.isArray(value.items)) return value.items.filter(function (item) {
              return item && typeof item.key === 'string' && typeof item.requestId === 'string' && Number.isFinite(item.dispatchedAt);
            });
          } catch (error) { /* Keep the current session usable when storage is unavailable. */ }
          return [];
        }
        function chatOutboxScope(ctx) {
          return ctx && ctx.patientId ? JSON.stringify(['operator-demo-admin',ctx.tenantId,ctx.projectId,ctx.doctorId,ctx.patientId]) : '';
        }
        function persistChatOutbox() {
          try { window.localStorage.setItem(chatOutboxKey, JSON.stringify({version:1,items:chatOutbox})); } catch (error) { /* Dispatch already succeeded; never dispatch again to retry local persistence. */ }
        }
        function chatWasDispatched(ctx) {
          var key=chatOutboxScope(ctx),entry=chatOutbox.find(function(item){return item.key===key;});
          if(!entry)return false;
          var queue=window.DoctorReception,task=queue&&queue.latestAssignment({patientId:ctx.patientId,sceneCode:ctx.sceneCode});
          // Only a later incoming assignment or explicit takeover by this doctor
          // can bring it back. An old assignment, first reply or timeout cannot.
          var owner=window.PatientHandoffs.getOwner(ctx),takenOver=owner&&owner.kind==='doctor'&&owner.id===ctx.doctorId&&window.PatientHandoffs.getRecords(ctx).some(function(item){return item.eventType==='human_takeover'&&item.to&&item.to.kind==='doctor'&&item.to.id===ctx.doctorId&&(Array.isArray(entry.takeoverIds)?item.createdAt>=entry.dispatchedAt&&entry.takeoverIds.indexOf(item.id)<0:item.createdAt>entry.dispatchedAt);});
          if(takenOver||task&&task.tenantId===ctx.tenantId&&task.projectId===ctx.projectId&&task.doctorId===ctx.doctorId&&task.assignedAt>entry.dispatchedAt&&task.handoffRequestId!==entry.requestId&&(!task.result||task.result==='accepted')){
            chatOutbox=chatOutbox.filter(function(item){return item.key!==key;});persistChatOutbox();return false;
          }
          return true;
        }
        function chatNeedsHumanAttention(ctx) {
          if(conversationInbox){chatWasDispatched(ctx);var row=conversationInbox.rows(ctx.doctorName||state.chatDoctorSelected).find(function(item){return item.patientId===ctx.patientId;});return !!row&&chatInboxProjection('human',ctx.doctorName).rows.some(function(item){return item.key===row.inboxKey;});}
          return window.PatientHandoffs.needsHumanAttention(ctx)!==false&&!chatWasDispatched(ctx);
        }
        function chatVisibleConversations() {return conversationInbox?chatInboxRows(state.chatWorkQueue):getChatConversationData().filter(function(conversation){var ctx=window.ChatPatientArchive.context(conversation,state.chatDoctorSelected,state.chatArchiveScene);ctx.sceneCode=window.PatientHandoffs.sceneCode(ctx.projectId,ctx.sceneName);return chatNeedsHumanAttention(ctx);});}
        function recordChatDispatch(ctx,requestId) {
          var key=chatOutboxScope(ctx);if(!key)return;
          if(!chatOutbox.some(function(item){return item.key===key&&item.requestId===requestId;})){
            chatOutbox=chatOutbox.filter(function(item){return item.key!==key;});
            chatOutbox.push({key:key,requestId:requestId,dispatchedAt:Date.now(),takeoverIds:window.PatientHandoffs.getRecords(ctx).filter(function(item){return item.eventType==='human_takeover';}).map(function(item){return item.id;})});persistChatOutbox();
          }
          if(state.modal&&state.modal.type==='transfer'&&chatOutboxScope(state.modal.context)===key)state.modal=null;
          if(ctx.patientName===state.chatSelected&&ctx.doctorId===getHandoffContext().doctorId){
            var keyword=String(state.chatConversationSearch||'').trim().toLowerCase();
            var visible=queryChatConversations(chatVisibleConversations(),state.chatQueryApplied).filter(function(item){return (state.chatConversationTab==='全部'||item.type===state.chatConversationTab)&&(!keyword||item.name.toLowerCase().indexOf(keyword)>=0||conversationContentMatches(item,keyword).length>0);});
            if(!state.chatConversationNewestFirst)visible.reverse();
            selectArchivePatient(visible.length?visible[0].name:'',visible.length&&visible[0].inboxKey);state.chatDraft='';state.chatHistoryOpen=false;state.chatHistoryCalendarOpen=false;
          }
        }
        function getHandoffContext() {
          var conversation=selectedChatConversation();
          var ctx=window.ChatPatientArchive.context(conversation,state.chatDoctorSelected,state.chatArchiveScene);
          ctx.sceneCode=window.PatientHandoffs.sceneCode(ctx.projectId,ctx.sceneName);if(conversation&&conversation.inboxKey)ctx.inboxConversationKey=conversation.inboxKey;
          return ctx;
        }
        function handoffSummary(ctx) {
          var conversation=getChatConversationData().filter(function(item){return item.name===ctx.patientName;})[0];
          if(!conversation)return '';
          var excerpts=ctx.patientName==='王德华'?state.chatMessages.filter(function(message){return message.side==='other';}).slice(-3).map(function(message){return message.text;}):(conversation.messages||[]).slice(0,3);
          return '档案诊断原文：'+String(state.chatPatientBasic.diagnosis||'未填写')+'\n近期会话原文节选：'+excerpts.join('；');
        }
        function openHandoff(mode,trigger) {
          var ctx=getHandoffContext();
          if(conversationInbox&&!chatInboxCanOperate()){state.modal=null;render();return;}
          var subject=conversationInbox&&chatInboxSubject(),c=conversationInbox&&chatInboxSelected();
          if(c&&(c.kind==='group'||!subject.legacyRef||window.PatientHandoffs.getOwner(ctx)&&window.PatientHandoffs.getOwner(ctx).kind==='ai')){openModal({type:'transfer',mode:mode,context:Object.assign({},ctx,{group:true}),group:true,scopeOnly:true,currentAssigneeId:subject.assignee&&subject.assignee.id,subjectId:subject.id,subjectRevision:subject.revision,subjectCutoff:subject.lastPatientSeq,requestId:'handoff-request-'+Date.now()+'-'+(++handoffRequestSequence),reason:'',reasonDetail:'',summary:subject.requestText,toId:'',recipientType:'assistant'},trigger);return;}
          if(!ctx.patientId||!ctx.sceneCode){toast('请先选择明确的患者和场景码');return;}
          openModal({type:'transfer',mode:mode,context:ctx,requestId:'handoff-request-'+Date.now()+'-'+(++handoffRequestSequence),reason:'',reasonDetail:'',summary:handoffSummary(ctx),toId:'',recipientType:'assistant',subjectId:subject&&subject.id,subjectRevision:subject&&subject.revision,subjectCutoff:subject&&subject.lastPatientSeq},trigger);
        }
        function captureHandoffInput(target) {
          if(!state.modal||state.modal.type!=='transfer')return false;
          var field=target.getAttribute('data-modal'),mapping={transferTo:'toId',transferReason:'reason',transferReasonDetail:'reasonDetail',transferSummary:'summary'};
          if(!mapping[field])return false;
          state.modal[mapping[field]]=target.value;state.modal.error='';
          var other=shell.querySelector('[data-handoff-other]');if(other)other.hidden=state.modal.reason!=='其他';
          var error=shell.querySelector('[data-handoff-error]');if(error)error.textContent='';
          return true;
        }
        var chatFollowupBuckets=Object.create(null),activeChatFollowupKey="";
        function syncChatFollowups() {
          var conversation=selectedChatConversation();
          var ctx=window.ChatPatientArchive.context(conversation||{name:state.chatSelected,type:"私聊"},state.chatDoctorSelected,state.chatArchiveScene);
          if(!conversation||ctx.group||!ctx.patientId||!ctx.doctorId)return false;
          var key=[ctx.tenantId,ctx.projectId,ctx.doctorId,ctx.patientId,ctx.sceneName].join("|");
          if(key!==activeChatFollowupKey){
            if(activeChatFollowupKey){chatFollowupBuckets[activeChatFollowupKey]={records:state.chatFollowups,content:state.chatFollowupContent,date:state.chatFollowupDate,open:state.chatFollowupFormOpen,expanded:state.chatFollowupExpandedEntry};}
            var bucket=chatFollowupBuckets[key]||{records:state.chatSelected==="王德华"&&state.chatDoctorSelected==="张医生"&&state.chatArchiveScene==="慢病随访"?[{date:"2026-08-23",content:"已提醒患者按计划记录指标，患者表示知晓。"}]:[],content:"",date:todayLocalIso(),open:false,expanded:null};
            state.chatFollowups=bucket.records;state.chatFollowupContent=bucket.content;state.chatFollowupDate=bucket.date;state.chatFollowupFormOpen=bucket.open;state.chatFollowupExpandedEntry=bucket.expanded;activeChatFollowupKey=key;
          }
          return true;
        }
        function renderPatientFollowupsPanel() {
          if(!syncChatFollowups())return '<div class="ops-workbench-empty">请先选择明确的患者和医生</div>';
          var followupEntries = state.chatFollowups.map(function (entry, index) {
            var expanded = state.chatFollowupExpandedEntry === index;
            var overviewChars = Array.from(entry.content || "");
            var overview = overviewChars.slice(0, 14).join("") + (overviewChars.length > 14 ? "…" : "");
            return '<article class="ops-followup-entry"><strong>' + escapeHtml(entry.date) + '</strong><p>' + escapeHtml(expanded ? entry.content : overview) + '</p><button class="ops-link ops-followup-detail-toggle" type="button" data-action="chat-followup-detail-toggle" data-index="' + index + '" aria-expanded="' + (expanded ? "true" : "false") + '">' + (expanded ? "收起详情" : "查看详情") + '</button></article>';
          }).join("");
          var followupForm = state.chatFollowupFormOpen ? '<div class="ops-followup-form is-open"><label class="ops-followup-field"><span>跟进日期</span><input type="date" data-bind="chat.followupDate" max="' + todayLocalIso() + '" value="' + escapeHtml(state.chatFollowupDate) + '"></label><label class="ops-followup-field is-content"><span>跟进内容</span><span class="ops-followup-content-wrap"><textarea data-bind="chat.followupContent" maxlength="500" aria-describedby="ops-followup-content-count" placeholder="记录本次人工跟进内容">' + escapeHtml(state.chatFollowupContent) + '</textarea><span class="ops-followup-count" id="ops-followup-content-count" data-chat-followup-count aria-live="polite">' + state.chatFollowupContent.length + ' / 500</span></span></label><button class="ops-button ops-button-primary ops-followup-save" type="button" data-action="chat-followup-save">保存跟进记录</button></div>' : "";
          var followupHistory = state.chatFollowupFormOpen ? "" : '<div class="ops-followup-history">' + followupEntries + '</div>';
          var followupPanel = '<div class="ops-followup-panel ' + (state.chatFollowupFormOpen ? "is-creating" : "") + '"><section class="ops-followup-card ' + (state.chatFollowupFormOpen ? "is-creating" : "") + '" aria-labelledby="ops-followup-history-title"><div class="ops-followup-card-header"><div class="ops-followup-card-title"><h3 id="ops-followup-history-title">跟进记录</h3><span>' + state.chatFollowups.length + '条</span></div><button class="ops-link" type="button" data-action="chat-followup-create-toggle" aria-expanded="' + (state.chatFollowupFormOpen ? "true" : "false") + '">' + (state.chatFollowupFormOpen ? "取消" : "新增") + '</button></div>' + followupForm + followupHistory + '</section></div>';
          return followupPanel;
        }
        function renderPatientFollowupsPage() {
          var navigation=quickRepliesEmbedded?'':'<nav class="qr-page-navigation" aria-label="患者跟进页面导航"><span></span><strong>患者跟进</strong><button type="button" data-action="patient-followups-close">关闭 ×</button></nav>';
          return '<section class="ops-patient-followups-page">'+navigation+(followupNavigationHint?'<p class="qr-navigation-hint" role="status">'+escapeHtml(followupNavigationHint)+'</p>':'')+renderPatientFollowupsPanel()+'</section>';
        }
        function renderChatPage() {
          if (aiSummaryStandalone) {
            var aiConversation = selectedChatConversation() || { name: state.chatSelected, type: "私聊", tags: [] };
            return renderPatientAiSummaryPage(aiConversation, quickRepliesEmbedded);
          }
          if (patientFollowupsStandalone) return renderPatientFollowupsPage();
          if (quickRepliesStandalone) return renderQuickReplyPage(quickRepliesEmbedded);
          if (patientProfileStandalone) {
            var conversation = selectedChatConversation() || { name:state.chatSelected, type:"私聊", tags:[] };
            return renderPatientArchivePage(conversation, quickRepliesEmbedded);
          }
          var doctorGroups = [
            { project: "广德慢病项目", doctors: [
              { name: "张医生", status: "在线", count: 8 },
              { name: "李医生", status: "离线", count: 3 }
            ] },
            { project: "中山肿瘤随访", doctors: [
              { name: "陈医生", status: "在线", count: 5 }
            ] }
          ];
          var conversations = chatVisibleConversations();
          var queriedConversations = queryChatConversations(conversations, state.chatQueryApplied);
          var doctorIndex = 0;
          var doctorHtml = doctorGroups.map(function (group) {
            var collapsed = !!state.chatCollapsedProjects[group.project];
            var rows = group.doctors.map(function (item) {
              var active = state.chatDoctorSelected === item.name;
              var workCount=conversationInbox?chatInboxFiltered("human",item.name,true).length:item.count;
              doctorIndex += 1;
              return '<button class="ops-doctor-row ' + (active ? "is-active" : "") + '" type="button" data-action="chat-doctor" data-chat-doctor-name="' + escapeHtml(item.name) + '"><span class="ops-doctor-avatar-wrap"><span class="ops-avatar">医</span><span class="ops-doctor-presence ' + (item.status === "在线" ? "is-online" : "is-offline") + '" role="img" aria-label="' + item.status + '" title="' + item.status + '"></span></span><span><strong>' + escapeHtml(item.name) + '</strong></span>'+'<span class="ops-unread" data-inbox-account-count="'+escapeHtml(item.name)+'" '+(workCount?'':'hidden')+'>'+workCount+'</span>'+'</button>';
            }).join("");
            return '<div class="ops-doctor-group" data-chat-project="' + escapeHtml(group.project) + '" data-chat-collapsed="' + (collapsed ? "true" : "false") + '"><button class="ops-project-title" type="button" data-action="chat-project-toggle" data-project="' + escapeHtml(group.project) + '" aria-expanded="' + (collapsed ? "false" : "true") + '" aria-label="' + (collapsed ? "展开" : "折叠") + escapeHtml(group.project) + '">' + icon(collapsed ? "fa-chevron-right" : "fa-chevron-down") + '<span>' + escapeHtml(group.project) + "（" + group.doctors.length + "）</span>"+'<span class="ops-unread" data-inbox-project-count="'+escapeHtml(group.project)+'" '+(chatInboxProjectCount(group.project)?'':'hidden')+'>'+chatInboxProjectCount(group.project)+'</span></button><div class="ops-doctor-list" ' + (collapsed ? "hidden" : "") + ">" + rows + "</div></div>";
          }).join("") + '<div class="ops-chat-empty" data-chat-doctor-empty hidden>暂无匹配的项目或医生</div>';
          var doctorSearch = state.chatDoctorFilterOpen ? '<label class="ops-search-shell ops-chat-doctor-search">' + icon("fa-magnifying-glass") + '<input id="ops-chat-doctor-search" data-bind="chat.doctorSearch" value="' + escapeHtml(state.chatDoctorSearch) + '" placeholder="请输入项目/医生" aria-label="搜索项目或医生"></label>' : "";
          var doctorFilter = '<button class="ops-icon-button ops-chat-filter-toggle ' + (state.chatDoctorFilterOpen ? "is-active" : "") + '" type="button" data-action="chat-doctor-filter" aria-label="' + (state.chatDoctorFilterOpen ? "隐藏项目和医生搜索框" : "显示项目和医生搜索框") + '" aria-pressed="' + (state.chatDoctorFilterOpen ? "true" : "false") + '">' + icon("fa-magnifying-glass") + "</button>";
          var conversationCounts = {
            "全部": chatInboxFiltered(state.chatWorkQueue,null,false).length,
            "私聊": chatInboxFiltered(state.chatWorkQueue,null,false).filter(function (item) { return item.type === "私聊"; }).length,
            "群聊": chatInboxFiltered(state.chatWorkQueue,null,false).filter(function (item) { return item.type === "群聊"; }).length
          };
          var doctorPanelToggle = '<button class="ops-icon-button ops-doctor-panel-toggle ' + (state.chatDoctorPanelCollapsed ? "is-collapsed" : "") + '" type="button" data-action="chat-doctor-panel-toggle" aria-label="' + (state.chatDoctorPanelCollapsed ? "展开项目/医生模块" : "收起项目/医生模块") + '" title="' + (state.chatDoctorPanelCollapsed ? "展开项目/医生" : "收起项目/医生") + '">' + icon(state.chatDoctorPanelCollapsed ? "fa-angles-right" : "fa-angles-left") + "</button>";
          var conversationTabs = '<div class="ops-conversation-tabbar">' + doctorPanelToggle + '<div class="ops-conversation-tabs" role="tablist" aria-label="会话类型">' + ["全部", "私聊", "群聊"].map(function (tab) {
            return '<button class="' + (state.chatConversationTab === tab ? "is-active" : "") + '" type="button" role="tab" aria-selected="' + (state.chatConversationTab === tab ? "true" : "false") + '" data-action="chat-conversation-tab" data-value="' + tab + '"><span>' + tab + '</span><span class="ops-conversation-count">' + conversationCounts[tab] + "</span></button>";
          }).join("") + "</div></div>";
          var tabConversations = queriedConversations.filter(function (item) { return state.chatConversationTab === "全部" || item.type === state.chatConversationTab; });
          var conversationOrder = state.chatWorkQueue === "human" || state.chatConversationNewestFirst ? tabConversations : tabConversations.slice().reverse();
          var conversationKeyword = String(state.chatConversationSearch || "").trim().toLowerCase();
          var selectedConversation=conversationOrder.find(function(item){return (state.chatConversationSelectedKey?item.inboxKey===state.chatConversationSelectedKey:item.name===state.chatSelected)&&(!conversationKeyword||item.name.toLowerCase().indexOf(conversationKeyword)>=0||conversationContentMatches(item,conversationKeyword).length);});
          if(selectedConversation){bindInboxBasic(selectedConversation);state.chatConversationSelectedKey=selectedConversation.inboxKey||null;if(chatNeedsHumanAttention(getHandoffContext()))state.chatReadOnlyContext=null;}
          var historicalConversation=!selectedConversation&&state.chatReadOnlyContext===chatOutboxScope(getHandoffContext())?selectedChatConversation():null;
          if(historicalConversation)selectedConversation=historicalConversation;
          if(!selectedConversation&&state.chatSelected){
            selectedConversation=conversationOrder.find(function(item){return !conversationKeyword||item.name.toLowerCase().indexOf(conversationKeyword)>=0||conversationContentMatches(item,conversationKeyword).length>0;});
            selectArchivePatient(selectedConversation?selectedConversation.name:'',selectedConversation&&selectedConversation.inboxKey);state.chatDraft='';state.chatHistoryOpen=false;
          }
          if(state.modal&&state.modal.type==='transfer'&&!state.modal.group&&!chatInboxCanOperate())state.modal=null;
          if(state.modal&&state.modal.type==='transfer'&&!state.modal.group&&window.PatientHandoffs.getOwner(state.modal.context)&&window.PatientHandoffs.getOwner(state.modal.context).kind==='ai'){state.modal.group=true;state.modal.scopeOnly=true;state.modal.currentAssigneeId=conversationInbox.actor.id;state.modal.context=Object.assign({},state.modal.context,{group:true});}
          var showCountOnly = countMatchedConversations(conversationOrder, conversationKeyword) > 1;
          var conversationHtml = conversationOrder.map(function(item){
            var v=item.inboxView,s=v&&v.summary,unread=v&&v.unread;
            return '<button class="ops-conversation-row '+((state.chatConversationSelectedKey?state.chatConversationSelectedKey===item.inboxKey:state.chatSelected===item.name)?'is-active':'')+'" type="button" data-action="chat-select" data-name="'+escapeHtml(item.name)+'" data-chat-conversation-name="'+escapeHtml(item.name)+'" data-chat-conversation-id="'+escapeHtml(item.conversationId||'')+'" data-chat-conversation-key="'+escapeHtml(item.inboxKey||'')+'" data-chat-conversation-type="'+item.type+'" data-chat-conversation-date="'+item.date+'"><span class="ops-avatar">'+escapeHtml(item.name.slice(0,1))+'</span><span class="ops-inbox-row-copy"><strong>'+escapeHtml(item.name)+(unread?'<i class="ops-inbox-unseen" aria-label="未查看"></i>':'')+'</strong><small class="ops-conversation-summary">'+chatInboxRowSummary(item)+'</small><small class="ops-inbox-row-meta"><span>'+escapeHtml(v?chatInboxState(v):'')+'</span>'+(v&&v.humanSubjectCount>1?'<span data-inbox-matter-count>'+v.humanSubjectCount+'项待人工</span>':'')+(s?'<span data-inbox-wait data-waiting-since="'+s.waitingSince+'">'+(s.overdue?'已超时 · ':'')+chatInboxWaitText(s.waitingSince)+'</span>':'')+'</small></span></button>';
          }).join('');
          conversationHtml += '<div class="ops-chat-empty" data-chat-conversation-empty ' + (conversationOrder.length ? "hidden" : "") + '>暂无符合条件的会话</div>';
          var conversationSearch = state.chatConversationSearchOpen ? '<label class="ops-search-shell ops-chat-conversation-search">' + icon("fa-magnifying-glass") + '<input id="ops-chat-conversation-search" data-bind="chat.conversationSearch" value="' + escapeHtml(state.chatConversationSearch) + '" placeholder="搜索名称或聊天内容" aria-label="搜索患者、群聊名称或聊天内容"></label>' : "";
          var conversationToolbar = '<div class="ops-conversation-toolbar"><strong>会话列表</strong><div class="ops-conversation-tools"><button class="ops-icon-button" type="button" data-action="chat-conversation-search" aria-label="' + (state.chatConversationSearchOpen ? "隐藏会话搜索框" : "显示会话搜索框") + '">' + icon("fa-magnifying-glass") + '</button><button class="ops-icon-button" type="button" data-action="chat-conversation-sort" aria-label="' + (state.chatConversationNewestFirst ? "切换为最早优先" : "切换为最新优先") + '">' + icon("fa-arrow-down-short-wide") + '</button><button class="ops-icon-button" type="button" data-action="chat-conversation-refresh" aria-label="刷新会话列表">' + icon("fa-rotate-right") + "</button></div></div>";
          if(!selectedConversation){
            return '<section class="ops-chat-page">'+toolbar(['首页','会话管理','聚合聊天'],renderIconActions('',''))+'<div class="ops-chat-layout '+(state.chatDoctorPanelCollapsed?'is-doctor-panel-collapsed':'')+'"><aside class="ops-chat-column"><div class="ops-chat-column-header"><span>项目/托管账号</span>'+doctorFilter+'</div>'+doctorSearch+doctorHtml+'</aside><aside class="ops-chat-column">'+conversationTabs+conversationToolbar+renderChatInboxTabs()+conversationSearch+conversationHtml+'</aside><main class="ops-chat-column ops-chat-main"><div class="ops-chat-empty">请选择会话</div></main><div class="ops-chat-resize-handle" aria-hidden="true"></div><aside class="ops-chat-column ops-chat-workbench"></aside></div></section>';
          }
          var workbenchPanelToggle = '<button class="ops-icon-button ops-workbench-panel-toggle ' + (state.chatWorkbenchCollapsed ? "is-collapsed" : "") + '" type="button" data-action="chat-workbench-panel-toggle" aria-label="' + (state.chatWorkbenchCollapsed ? "展开右侧工作台" : "收起右侧工作台") + '" title="' + (state.chatWorkbenchCollapsed ? (state.chatHistoryOpen ? "展开聊天记录" : "展开右侧工作台") : (state.chatHistoryOpen ? "收起聊天记录" : "收起右侧工作台")) + '">' + icon(state.chatWorkbenchCollapsed ? "fa-angles-left" : "fa-angles-right") + "</button>";
          var selectedInbox=conversationInbox&&chatInboxSelected(),selectedSubject=conversationInbox&&chatInboxSubject(),canOperate=conversationInbox?chatInboxCanOperate():!historicalConversation;
          if(conversationInbox)bindInboxDraft(selectedInbox,selectedSubject);
          var chatHeader = '<div class="ops-chat-heading ops-chat-heading-compact"><div class="ops-chat-person"><div class="ops-chat-identity"><h2>' + escapeHtml(selectedConversation.name) + '</h2><span class="ops-chat-demographics">· ' + (historicalConversation?'历史对话':escapeHtml(selectedConversation.type)) + ' · 来源医生：' + escapeHtml(state.chatDoctorSelected) + '</span></div></div><div class="ops-inline-actions">'+(!selectedInbox||historicalConversation?'':'<button class="ops-link" type="button" data-action="chat-unread">' + icon("fa-envelope") + '标记未读</button>'+(canOperate?'<button class="ops-link" type="button" data-action="chat-transfer">'+icon("fa-arrow-right-arrow-left")+'转接</button>':selectedSubject&&conversationInbox.store.canOperate(selectedSubject.id,{action:'takeover'})?'<button class="ops-link" type="button" data-action="inbox-takeover">人工接手</button>':'')) + workbenchPanelToggle + '</div></div>';
          var composer = '<div class="ops-composer"><div class="ops-composer-tools">' + icon("fa-face-smile", "表情") + icon("fa-image", "图片") + icon("fa-paperclip", "文件") + '<button class="ops-chat-history-toggle ' + (state.chatHistoryOpen ? "is-active" : "") + '" type="button" data-action="chat-history-toggle" aria-label="' + (state.chatHistoryOpen ? "隐藏聊天记录" : "查看聊天记录") + '" aria-pressed="' + (state.chatHistoryOpen ? "true" : "false") + '" title="聊天记录">' + icon("fa-clock-rotate-left") + '</button><button class="ops-chat-ai-summary-entry" type="button" data-action="chat-ai-summary-open" aria-label="打开AI小结" title="打开AI小结">AI小结</button></div><div class="ops-composer-row"><textarea id="ops-chat-input" data-bind="chat.draft" maxlength="500" placeholder="请输入消息，Enter 发送">' + escapeHtml(state.chatDraft) + '</textarea>' + button("发送", "primary", "chat-send") + "</div></div>";
          if(inboxSending[state.chatDraftScope])composer=composer.replace('data-action="chat-send"','data-action="chat-send" disabled').replace('>发送</button>','>发送中…</button>');
          if(!canOperate)composer='';
          else if(selectedInbox&&selectedInbox.kind==='group')composer=composer.replace('<div class="ops-composer">','<div class="ops-composer"><div class="ops-inbox-reply-scope">回复 '+escapeHtml(chatInboxSpeaker(selectedInbox,selectedSubject.speakerId))+' · 当前事项</div>');
          chatHeader='<div class="ops-inbox-heading-stack">'+chatHeader+(selectedInbox?renderChatInboxMatters(selectedInbox):'')+'</div>'; 
          var sidebarContext=window.ChatPatientArchive.context(selectedConversation,state.chatDoctorSelected,state.chatArchiveScene),sidebarEnvironment=window.SidebarConfig.environment();
          sidebarContext.patientId=selectedConversation.patientId||'';
          var todoEntryURL=new URL('my-todos.html?embedded=1&host=web',location.href);if(sidebarContext.patientId){todoEntryURL.searchParams.set('patientId',sidebarContext.patientId);todoEntryURL.searchParams.set('patientName',sidebarContext.patientName||'');}
          var configuredTabs=window.SidebarConfig.orderFor(sidebarContext,sidebarEnvironment,window.SidebarConfig.visible(sidebarContext,sidebarEnvironment,'web')).map(function(tab){tab.value=window.SidebarConfig.inlineBuiltin(tab,sidebarEnvironment)||'config:'+tab.id;return tab;});
          var activeConfiguredTab=configuredTabs.filter(function(tab){return tab.value===state.chatWorkbenchTab;})[0]||configuredTabs[0];
          if(activeConfiguredTab)state.chatWorkbenchTab=activeConfiguredTab.value;
          var workbenchScope=[sidebarContext.tenantId||'tenant-demo',sidebarContext.projectId,sidebarContext.doctorId,sidebarEnvironment].join('|');
          var workbenchTabs='<div class="ops-workbench-tabs" role="tablist" aria-label="会话工作台，可拖动调整标签顺序" data-chat-workbench-tabs data-chat-workbench-scope="'+escapeHtml(workbenchScope)+'">'+configuredTabs.map(function(tab){return '<button class="'+(state.chatWorkbenchTab===tab.value?'is-active':'')+'" type="button" role="tab" aria-selected="'+(state.chatWorkbenchTab===tab.value?'true':'false')+'" draggable="true" data-chat-workbench-tab-id="'+escapeHtml(tab.id)+'" data-action="chat-workbench-tab" data-value="'+escapeHtml(tab.value)+'" title="拖动调整顺序">'+escapeHtml(tab.name)+'</button>';}).join('')+'</div>';
          var quickReplyPanel = renderQuickReplyPage(true);
          var followupPanel = renderPatientFollowupsPanel();
          var workbenchContent = state.chatWorkbenchTab === "我的待办" ? '<iframe class="sbc-custom-frame ops-my-todos-frame" title="我的待办" src="'+escapeHtml(todoEntryURL.href)+'" referrerpolicy="same-origin"></iframe>' : state.chatWorkbenchTab === "患者交接" ? window.PatientHandoffs.render(getHandoffContext(),{readOnly:!canOperate}) : state.chatWorkbenchTab === "患者档案" ? renderPatientArchivePage(selectedConversation, true) : state.chatWorkbenchTab === "AI小结" ? renderPatientAiSummaryPage(selectedConversation, true) : state.chatWorkbenchTab === "患者跟进" ? followupPanel : quickReplyPanel;
          if(!activeConfiguredTab)workbenchContent='<div class="ops-workbench-empty">当前环境、项目和医生下暂无可用Tab</div>';
          else if(activeConfiguredTab.value.indexOf('config:')===0){
            var configuredURL=window.SidebarConfig.urlFor(activeConfiguredTab,sidebarEnvironment,sidebarContext);
            workbenchContent=configuredURL&&configuredURL.origin===location.origin?'<iframe class="sbc-custom-frame" title="'+escapeHtml(activeConfiguredTab.name)+'" src="'+escapeHtml(configuredURL.href)+'" referrerpolicy="no-referrer"></iframe>':'<div class="sbc-external-tab"><strong>'+escapeHtml(activeConfiguredTab.name)+'</strong>'+(configuredURL?'<a href="'+escapeHtml(configuredURL.href)+'" target="_blank" rel="noopener noreferrer">打开页面</a>':'暂无可用链接')+'</div>';
          }
          var workbench = state.chatHistoryOpen ? renderChatHistoryPanel(selectedConversation) : workbenchTabs + workbenchContent;
          var layoutClass = (state.chatDoctorPanelCollapsed ? "is-doctor-panel-collapsed " : "") + (state.chatWorkbenchCollapsed ? "is-workbench-collapsed " : "") + (state.chatHistoryOpen && !state.chatWorkbenchCollapsed ? "is-history-open " : "") + ((state.chatWorkbenchTab === "患者档案" || state.chatWorkbenchTab === "AI小结") && !state.chatHistoryOpen && !state.chatWorkbenchCollapsed ? "is-archive-open" : "");
          var layoutStyle = state.chatWorkbenchCollapsed ? "" : ' style="grid-template-columns:' + (state.chatDoctorPanelCollapsed ? '250px ' : '168px 250px ') + 'minmax(420px, 1fr) 6px ' + state.chatWorkbenchWidth + 'px"';
          return '<section class="ops-chat-page">' + toolbar(["首页", "会话管理", "聚合聊天"], renderIconActions("", "")) + '<div class="ops-chat-layout ' + layoutClass + '"' + layoutStyle + '><aside class="ops-chat-column"><div class="ops-chat-column-header"><span>项目/托管账号</span>' + doctorFilter + "</div>" + doctorSearch + doctorHtml + '</aside><aside class="ops-chat-column">' + conversationTabs + conversationToolbar + renderChatInboxTabs() + conversationSearch + conversationHtml + '</aside><main class="ops-chat-column ops-chat-main">' + chatHeader + '<div class="ops-chat-thread" id="ops-chat-thread">' + renderChatMessages(selectedConversation) + "</div>" + composer + '</main><div class="ops-chat-resize-handle" data-chat-resize-handle role="separator" aria-label="调整患者档案侧边栏宽度" tabindex="0"></div><aside class="ops-chat-column ops-chat-workbench ' + (state.chatHistoryOpen ? "is-history-view" : state.chatWorkbenchTab === "患者跟进" && state.chatFollowupFormOpen ? "is-followup-creating" : "") + '">' + workbench + "</aside></div></section>";
        }

        function renderMemberRows() {
          var start = (state.memberPage - 1) * 5;
          return memberRows.slice(start, start + 5).map(function (row) {
            var checked = state.selectedMembers.indexOf(row.id) >= 0;
            return '<tr><td><input type="checkbox" data-member="' + row.id + '" ' + (checked ? "checked" : "") + ' aria-label="选择' + escapeHtml(row.assistant) + '"></td><td class="ops-cell-strong">' + escapeHtml(row.assistant) + '</td><td>' + escapeHtml(row.project) + '</td><td>' + (row.doctors.length ? '<button class="ops-link" type="button" data-action="member-view" data-id="' + row.id + '">查看（' + row.doctors.length + '）</button>' : "—") + '</td><td><span class="ops-tag ' + (row.assigned ? "is-green" : "is-gray") + '">' + (row.assigned ? "已分配" : "未分配") + '</span></td><td>' + row.max + '</td><td>' + row.current + '</td><td><span class="ops-tag ' + (row.transferable ? "is-green" : "is-gray") + '">' + (row.transferable ? "可转接" : "不可转接") + '</span></td><td><div class="ops-row-actions"><button class="ops-link" type="button" data-action="member-adjust" data-id="' + row.id + '">调整分配</button></div></td></tr>';
          }).join("");
        }

        function renderMemberAssignmentPage() {
          var filter = '<div class="ops-filter-panel ops-member-filter"><label class="ops-field"><span class="ops-field-label">分配状态</span><select><option>全部</option><option>已分配</option><option>未分配</option></select></label><label class="ops-field"><span class="ops-field-label">可被转接状态</span><select><option>全部</option><option>可转接</option><option>不可转接</option></select></label><div class="ops-filter-actions">' + button("重置", "", "member-reset") + button("查询", "primary", "member-search") + "</div></div>";
          var tools = '<div class="ops-toolbar-row"><div><strong>成员分配列表</strong><span style="margin-left:12px;color:var(--text-secondary,#4f6e91)">已选择 ' + state.selectedMembers.length + ' 项</span></div><div class="ops-inline-actions">' + button("批量修改分配", "primary-outline", "member-batch", "", "fa-user-gear") + button("删除", "danger-outline", "member-delete", "", "fa-trash-can") + "</div></div>";
          var table = '<section class="ops-card ops-table-panel"><div class="ops-table-scroll"><table class="ops-table ops-member-table" style="min-width:1160px" aria-label="成员分配与接待列表"><thead><tr><th></th><th>医助姓名</th><th>所属项目</th><th>已分配医生</th><th>分配状态</th><th>最大接待人数</th><th>当前接待人数</th><th>可被转接状态</th><th>操作</th></tr></thead><tbody>' + renderMemberRows() + "</tbody></table></div></section>";
          var pageTotal = Math.max(1, Math.ceil(memberRows.length / 5));
          return '<section class="ops-page ops-list-page" style="grid-template-rows:auto auto auto minmax(0,1fr) auto">' + toolbar(["首页", "会话管理", "成员分配与接待管理"], renderIconActions("新增成员分配", "member-add")) + filter + tools + table + '<footer class="ops-pagination"><span>共 ' + memberRows.length + ' 条</span>' + button("上一页", "", "member-page-prev", state.memberPage === 1 ? "disabled" : "") + '<button class="ops-page-number" type="button" aria-current="page">' + state.memberPage + '</button><span>/ ' + pageTotal + '</span>' + button("下一页", "", "member-page-next", state.memberPage === pageTotal ? "disabled" : "") + '</footer></section>';
        }

        function switchButton(key, on, label, disabled) {
          return '<button class="ops-switch ' + (on ? "is-on" : "") + '" type="button" role="switch" aria-checked="' + (on ? "true" : "false") + '" aria-label="' + escapeHtml(label) + '" data-action="rule-toggle" data-key="' + key + '"' + (disabled ? " disabled" : "") + '></button>';
        }

        function renderRulesPage() {
          var r = state.rules;
          var editing = state.rulesEditing;
          var disabled = editing ? "" : " disabled";
          var number = function (key, value, unit) {
            return '<span class="ops-inline-number"><input type="number" min="1" max="120" data-rule="' + key + '" value="' + escapeHtml(value) + '" aria-label="' + escapeHtml(unit) + '"' + disabled + '><span>' + escapeHtml(unit) + "</span></span>";
          };
          var timeParts = String(r.workTime || "09:00 - 18:00").split(/\s*-\s*/);
          var timePicker = state.ruleTimePickerOpen && editing
            ? '<div class="ops-time-picker" role="dialog" aria-label="选择工作时间"><label class="ops-field"><span class="ops-field-label">开始时间</span><input data-rule-time-start type="time" value="' + escapeHtml(timeParts[0] || "09:00") + '"></label><label class="ops-field"><span class="ops-field-label">结束时间</span><input data-rule-time-end type="time" value="' + escapeHtml(timeParts[1] || "18:00") + '"></label><div class="ops-time-picker-actions">' + button("取消", "", "rule-time-cancel") + button("确定", "primary", "rule-time-apply") + "</div></div>"
            : "";
          var timeControl = '<span class="ops-time-range"><input class="ops-time-range-trigger" aria-label="工作时间" value="' + escapeHtml(r.workTime) + '"' + (editing ? ' readonly data-action="rule-time-open" aria-haspopup="dialog" aria-expanded="' + (state.ruleTimePickerOpen ? "true" : "false") + '"' : " disabled") + ">" + icon("fa-clock") + timePicker + "</span>";
          var footer = editing ? '<footer class="ops-form-footer" style="margin:0 -24px">' + button("重置", "", "rule-reset") + button("保存配置", "primary", "rule-save") + "</footer>" : "";
          var body = '<div class="ops-page-scroll"><section class="ops-card ops-rule-card ' + (editing ? "is-editing" : "is-readonly") + '"><h1>超时与会话规则配置</h1><div class="ops-rule-row"><h2>超时会话标识</h2><div class="ops-rule-content"><div class="ops-rule-line"><span>显示超时标识</span>' + switchButton("timeoutMark", r.timeoutMark, "显示超时标识", !editing) + '<strong>' + (r.timeoutMark ? "显示" : "隐藏") + '</strong><label style="display:inline-flex;align-items:center;gap:8px;margin-left:28px"><input style="width:18px;height:18px" type="checkbox" data-rule-check="sms" ' + (r.sms ? "checked" : "") + disabled + '>开启短信提醒</label></div><p class="ops-field-hint">在对话列表中显示超时提醒标识；开启短信后，将通知当前接待成员。</p></div></div><div class="ops-rule-row"><h2>工作时间超时规则</h2><div class="ops-rule-content"><div class="ops-rule-line"><span>启用</span>' + switchButton("workEnabled", r.workEnabled, "工作时间超时规则", !editing) + '<strong>' + (r.workEnabled ? "启用" : "停用") + '</strong></div><div class="ops-rule-line"><span>客服未回复时长阈值</span>' + number("workThreshold", r.workThreshold, "分钟") + '<span>倒计时提醒量</span>' + number("workCountdown", r.workCountdown, "分钟") + '<span>工作时间</span>' + timeControl + '</div></div></div><div class="ops-rule-row"><h2>非工作时间超时规则</h2><div class="ops-rule-content"><div class="ops-rule-line"><span>启用</span>' + switchButton("offEnabled", r.offEnabled, "非工作时间超时规则", !editing) + '<strong>' + (r.offEnabled ? "启用" : "停用") + '</strong></div><div class="ops-rule-line"><span>客服未回复时长阈值</span>' + number("offThreshold", r.offThreshold, "分钟") + '<span>倒计时提醒量</span>' + number("offCountdown", r.offCountdown, "分钟") + '</div><p class="ops-field-hint">员工非工作时间内会使用该规则进行计算。</p></div></div><div class="ops-rule-row"><h2>会话类型规则</h2><div class="ops-rule-content"><div class="ops-choice-row"><label><input type="checkbox" data-rule-check="privateChat" ' + (r.privateChat ? "checked" : "") + disabled + '>私聊</label><label><input type="checkbox" data-rule-check="groupChat" ' + (r.groupChat ? "checked" : "") + disabled + '>群聊</label></div><p class="ops-field-hint">仅对已勾选的会话类型生效。</p></div></div>' + footer + "</section></div>";
          var toolbarActions = renderIconActions(editing ? "" : "编辑配置", editing ? "" : "rule-edit", "fa-pen-to-square");
          return '<section class="ops-page">' + toolbar(["首页", "会话管理", "超时与会话规则配置"], toolbarActions) + body + "</section>";
        }

        function modalFrame(title, body, footer, size) {
          return '<div class="ops-modal-backdrop" data-action="modal-backdrop"><section class="ops-modal ' + (size ? "is-" + size : "") + '" role="dialog" aria-modal="true" aria-labelledby="ops-modal-title"><header class="ops-modal-header"><h2 id="ops-modal-title">' + escapeHtml(title) + '</h2><button class="ops-icon-button" type="button" data-action="modal-close" aria-label="关闭">' + icon("fa-xmark") + '</button></header><div class="ops-modal-body">' + body + '</div><footer class="ops-modal-footer">' + footer + "</footer></section></div>";
        }

        function healthAddModalFrame(title, body, footer) {
          return '<div class="ops-modal-backdrop health-add-backdrop" data-action="modal-backdrop"><section class="ops-modal ops-health-modal is-sm" role="dialog" aria-modal="true" aria-labelledby="health-modal-title"><header class="ops-modal-header"><div><span class="ops-modal-kicker">基础健康指标</span><h2 id="health-modal-title">' + escapeHtml(title) + '</h2><p>只填写今天测量过的项目，提交后将同步到健康档案。</p></div><button class="ops-icon-button" type="button" data-action="modal-close" aria-label="关闭记录健康指标">' + icon("fa-xmark") + '</button></header><div class="ops-modal-body">' + body + '</div><footer class="ops-modal-footer">' + (footer || (button("暂不填写", "", "modal-close") + button("提交记录", "primary", "modal-save"))) + '</footer></section></div>';
        }

        function getPatientTagOptions() {
          var options = [];
          Object.keys(labelRows).forEach(function (scope) {
            var rows = labelRows[scope];
            rows.filter(function (row) { return row.level === 3; }).forEach(function (row) {
              var level2 = rows.filter(function (candidate) { return candidate.level === 2 && candidate.name === row.parent; })[0];
              var level1 = level2 ? rows.filter(function (candidate) { return candidate.level === 1 && candidate.name === level2.parent; })[0] : null;
              options.push({ level1: level1 ? level1.name : "—", level2: level2 ? level2.name : "—", name: row.name, tagType: scope });
            });
          });
          return options;
        }

        function renderModal() {
          var modal = state.modal;
          if (!modal) return "";
          var cancel = button("取消", "", "modal-close");
          var confirm = button("确定", "primary", "modal-save");
          if (modal.type === "health-add") {
            var healthFooter='<span class="ops-health-modal-progress" data-entry-progress>已完成 0 条记录</span>'+button("暂不填写", "", "modal-close")+button("提交记录", "primary", "modal-save", "disabled");
            return healthAddModalFrame("记录健康指标",window.PatientHealth.entryForm(modal),healthFooter);
          }
          if (modal.type === "health-chart") {
            var period=modal.period ? window.PatientHealth.report(modal.key,modal.period) : null;
            var title=window.PatientHealth.definition(modal.metric).name+"趋势"+(period?"（"+period.start+" 至 "+period.end+"）":"");
            return window.ImagePreview.render(window.PatientHealth.preview(modal.key,modal.metric,period),title);
          }
          if (modal.type === "chat-archive") {
            var archiveConversation = selectedChatConversation();
            var archiveContext = window.ChatPatientArchive.context(archiveConversation, state.chatDoctorSelected, state.chatArchiveScene);
            return modalFrame("患者健康档案", window.ChatPatientArchive.render(archiveContext, state.chatArchiveTab, state.chatArchiveMetric, true, state.chatArchiveTabsExpanded, state.chatPatientPhoneVisible, state.chatPatientBasic, state.chatArchiveTimelineDetail, 'chat-archive'), button("关闭", "", "modal-close"), "lg");
          }
          if (modal.type === "chat-material-delete") {
            return modalFrame("删除个人素材", '<p class="qr-delete-message">确定删除“'+escapeHtml(modal.name)+'”吗？</p><p class="ops-field-hint">删除后将从个人素材列表移除，此操作无法撤销。</p>', '<button type="button" class="ops-button" data-action="modal-close" data-initial-focus>取消</button>'+button("删除", "danger", "chat-material-delete-confirm"), "sm qr-delete-confirm");
          }
          if (modal.type === "chat-material-preview") {
            var editable = state.chatMaterialScope === "个人素材" && (materials["个人素材"] || []).some(function(item){return item.id===modal.materialId;});
            return modalFrame("预览素材", renderChatMaterialPreview(modal), cancel + (editable ? button("编辑", "default", "chat-material-edit") : "") + button("发送", "primary", "material-preview-send"), "sm");
          }
          if (modal.type === "label-level1") {
            return modalFrame("添加一级标签", '<div class="ops-form-grid"><label class="ops-field ops-full-span"><span class="ops-field-label"><span class="ops-required">*</span>名称</span><input data-initial-focus data-modal="name" maxlength="15" placeholder="请输入一级标签名称"></label><label class="ops-field ops-full-span"><span class="ops-field-label"><span class="ops-required">*</span>排序</span><input type="number" data-modal="sort" value="100"></label></div>', cancel + confirm, "sm");
          }
          if (modal.type === "label-level2") {
            return modalFrame("添加二级标签", '<p class="ops-field-hint" style="margin:0 0 18px">所属一级标签：' + escapeHtml(modal.parent) + '</p><div class="ops-form-grid"><label class="ops-field ops-full-span"><span class="ops-field-label"><span class="ops-required">*</span>名称</span><input data-initial-focus data-modal="name" maxlength="15" placeholder="请输入二级标签名称"></label><label class="ops-field ops-full-span"><span class="ops-field-label"><span class="ops-required">*</span>排序</span><input type="number" data-modal="sort" value="100"></label></div>', cancel + confirm, "sm");
          }
          if (modal.type === "label-name") {
            return modalFrame("添加标签名称", '<p class="ops-field-hint" style="margin:0 0 18px">所属二级标签：' + escapeHtml(modal.parent) + '</p><div class="ops-form-grid"><label class="ops-field ops-full-span"><span class="ops-field-label"><span class="ops-required">*</span>名称</span><input data-initial-focus data-modal="name" maxlength="15" placeholder="请输入标签名称"></label><label class="ops-field ops-full-span"><span class="ops-field-label"><span class="ops-required">*</span>排序</span><input type="number" data-modal="sort" value="100"></label></div>', cancel + confirm, "sm");
          }
          if (modal.type === "label-edit") {
            return modalFrame("编辑标签", '<div class="ops-form-grid"><label class="ops-field ops-full-span"><span class="ops-field-label"><span class="ops-required">*</span>标签名称</span><input data-initial-focus data-modal="name" maxlength="15" value="' + escapeHtml(modal.name) + '"></label><label class="ops-field ops-full-span"><span class="ops-field-label">排序值</span><input type="number" data-modal="sort" value="100"></label></div>', cancel + confirm, "sm");
          }
          if (modal.type === "chat-patient-tags" || modal.type === "patient-archive-tags") {
            var patientTagItems = modal.tags.length ? modal.tags.map(function (tag) {
              return '<span class="ops-patient-tag-chip"' + patientTagScopeAttribute(tag) + '><span>' + escapeHtml(tag) + '</span><button type="button" data-action="chat-patient-tag-remove" data-tag="' + escapeHtml(tag) + '" aria-label="删除标签' + escapeHtml(tag) + '">' + icon("fa-xmark") + "</button></span>";
            }).join("") : '<span class="ops-patient-tag-editor-empty">暂未添加标签</span>';
            var isArchiveTagModal = modal.type === "patient-archive-tags";
            var patientTagScope = modal.tagScope || "个人标签";
            var patientTagPage = modal.tagPage || 1;
            var allPatientTagOptions = isArchiveTagModal ? patientArchiveTagOptions : getPatientTagOptions().filter(function (option) { return option.tagType === patientTagScope; });
            var patientTagQuery = String(modal.patientTagSearch || '').trim().toLowerCase();
            allPatientTagOptions = allPatientTagOptions.filter(function(option) { return !patientTagQuery || option.name.toLowerCase().indexOf(patientTagQuery) >= 0; });
            var patientTagPageSize = 10;
            patientTagPage = Math.min(patientTagPage, Math.max(1, Math.ceil(allPatientTagOptions.length / patientTagPageSize)));
            modal.tagPage = patientTagPage;
            var patientTagOptionSource = allPatientTagOptions.slice((patientTagPage - 1) * patientTagPageSize, patientTagPage * patientTagPageSize);
            var patientTagOptions = patientTagOptionSource.map(function (option) {
              var selected = modal.tags.indexOf(option.name) >= 0;
              return '<button class="ops-patient-tag-option' + (selected ? ' is-selected' : '') + '" type="button" role="option" aria-selected="' + selected + '" data-action="chat-patient-tag-select" data-patient-tag-option' + patientTagScopeAttribute(option.name, option.tagType) + ' data-tag-name="' + escapeHtml(option.name) + '" data-tag="' + escapeHtml(option.name) + '"><span class="ops-patient-tag-check" aria-hidden="true">' + (selected ? icon('fa-check') : '') + '</span><span class="ops-patient-tag-option-copy"><strong>' + escapeHtml(option.name) + '</strong><span class="ops-patient-tag-path">' + escapeHtml(option.level1) + ' / ' + escapeHtml(option.level2) + (isArchiveTagModal ? ' · ' + escapeHtml(option.tagType) : '') + '</span></span></button>';
            }).join('');
            var patientTagDropdown = '<div class="ops-patient-tag-dropdown" id="ops-patient-tag-options" role="listbox" aria-label="标签选择列表" aria-multiselectable="true" data-patient-tag-options>' + patientTagOptions + '<div class="ops-patient-tag-option-empty" data-patient-tag-empty' + (allPatientTagOptions.length ? ' hidden' : '') + '>暂无匹配的标签名称</div></div>';
            var scopeTabs = isArchiveTagModal ? "" : '<span class="ops-patient-tag-scopes"><select data-change-action="chat-patient-tag-scope" aria-label="标签范围筛选">' + ["个人标签", "租户标签", "平台标签"].map(function (scope) { return '<option value="' + scope + '" ' + (scope === patientTagScope ? "selected" : "") + '>' + scope + '</option>'; }).join("") + '</select></span>';
            var pager = '<div class="ops-patient-tag-pager"' + (allPatientTagOptions.length > patientTagPageSize ? '' : ' hidden') + '><button type="button" data-action="chat-patient-tag-page" data-value="prev" ' + (patientTagPage <= 1 ? "disabled" : "") + '>上一页</button><span>第 ' + patientTagPage + ' 页</span><button type="button" data-action="chat-patient-tag-page" data-value="next" ' + (patientTagPage * patientTagPageSize >= allPatientTagOptions.length ? "disabled" : "") + '>下一页</button></div>';
            var patientTagBody = '<div class="ops-patient-tag-editor"><div class="ops-patient-tag-editor-section"><span class="ops-patient-tag-editor-title">已选标签</span><div class="ops-patient-tag-editor-list">' + patientTagItems + '</div></div><div class="ops-field"><span class="ops-field-label">选择标签</span><div class="ops-patient-tag-search"><div class="ops-patient-tag-search-row"><label class="ops-search-shell">' + icon("fa-magnifying-glass") + '<input data-initial-focus data-bind="chat.patientTagSearch" data-modal="patientTag" maxlength="20" value="' + escapeHtml(modal.patientTagSearch || "") + '" placeholder="搜索标签" aria-label="搜索标签名称" role="combobox" aria-autocomplete="list" aria-expanded="true" aria-controls="ops-patient-tag-options" autocomplete="off"></label>' + scopeTabs + '</div>' + patientTagDropdown + '</div>' + pager + '<span class="ops-field-hint">支持同时选择多个标签；最多选择 10 个标签</span></div></div>';
            return modalFrame("编辑患者标签", patientTagBody, cancel + button("保存", "primary", "modal-save"), "sm");
          }
          if (modal.type === "chat-material-create") {
            return modalFrame(modal.editId?"编辑素材":"新增素材",'<div class="qr-material-editor ops-material-create-card"><div class="ops-form-card-body">'+renderMaterialEditorFields()+'</div></div>',cancel+button("保存","primary","material-save"),"xl");
          }
          if (modal.type === "material-groups") {
            var managedGroupRows = modal.groups.length ? modal.groups.map(function (group, index) {
              return '<div class="ops-group-manager-row'+(modal.highlightedGroup===group?' is-new-group':'')+'" data-material-manager-index="'+index+'" role="group" tabindex="-1" aria-label="分组'+escapeHtml(group.name)+'"><div class="ops-group-manager-name"><button type="button" class="ops-group-manager-drag" draggable="true" data-material-manager-drag="'+index+'" aria-label="调整'+escapeHtml(group.name)+'顺序" aria-keyshortcuts="ArrowUp ArrowDown" title="拖动调整顺序">'+icon('fa-grip-lines')+'</button><div class="ops-group-manager-name-field"><input data-material-group-index="' + index + '" value="' + escapeHtml(group.name) + '" maxlength="20" aria-label="分组名称"><span class="ops-group-manager-edit-hint" aria-hidden="true">'+icon('fa-pen')+'</span></div></div><button class="ops-link ops-link-danger ops-group-manager-delete" type="button" data-action="material-group-delete" data-index="' + index + '" aria-label="删除'+escapeHtml(group.name)+'">'+icon('fa-trash-can')+'<span>删除</span></button></div>';
            }).join("") : '<div class="ops-group-manager-empty">暂无素材分组</div>';
            var managedGroupBody = '<div class="ops-group-manager-list">' + managedGroupRows + '</div>';
            var mobileGroupEntry='<div class="ops-group-manager-mobile-create"><button type="button" data-action="material-group-new">'+icon('fa-plus')+'<span>新增分组</span></button></div>';
            var managerTitle="管理" + (modal.scope === "租户素材" ? "公共素材" : modal.scope) + "分组";
            var managerHeader='<header class="ops-modal-header"><button type="button" class="ops-group-manager-nav-cancel" data-action="modal-close">取消</button><h2 id="ops-modal-title">'+escapeHtml(managerTitle)+'</h2><button type="button" class="ops-group-manager-nav-done" data-action="material-group-finish">完成</button></header>';
            var createDialog=modal.groupEditor?'<div class="ops-group-editor-backdrop" data-action="material-group-editor-backdrop"><section class="ops-group-editor-dialog" role="dialog" aria-modal="true" aria-labelledby="ops-group-editor-title"><header class="ops-group-editor-header"><h2 id="ops-group-editor-title">新增分组</h2><button type="button" data-action="material-group-editor-cancel" aria-label="关闭新增分组">'+icon('fa-xmark')+'</button></header><form data-material-group-create-form><div class="ops-group-editor-body"><label>分组名称<input data-modal="newGroupDialog" maxlength="20" aria-label="新分组名称" placeholder="请输入分组名称" value="'+escapeHtml(modal.newGroup||'')+'"></label><p class="ops-group-editor-error"'+(modal.groupEditor.error?' role="alert"':' hidden')+'>'+escapeHtml(modal.groupEditor.error||'')+'</p></div><div class="ops-group-editor-actions"><button type="button" data-action="material-group-editor-cancel">取消</button><button type="button" data-action="material-group-create"'+(String(modal.newGroup||'').trim()?'':' disabled')+'>新增</button></div></form></section></div>':'';
            return '<div class="ops-modal-backdrop is-group-manager-backdrop" data-action="modal-backdrop"><section class="ops-modal is-group-manager" role="dialog" aria-modal="true" aria-labelledby="ops-modal-title"'+(modal.groupEditor?' inert aria-hidden="true"':'')+'>'+managerHeader+'<div class="ops-modal-body">'+managedGroupBody+'</div>'+mobileGroupEntry+'</section>'+createDialog+'</div>';
          }
          if (modal.type === "confirm") {
            return modalFrame(modal.title || "确认操作", '<div style="display:grid;grid-template-columns:46px minmax(0,1fr);gap:14px;align-items:start"><span class="ops-type-icon" style="background:var(--tag-warning-surface,#fff8eb);color:var(--warning,#f5a000)">' + icon("fa-triangle-exclamation") + '</span><div><strong>' + escapeHtml(modal.message || "确定执行该操作吗？") + '</strong><p class="ops-field-hint">操作完成后，列表数据会立即更新。</p></div></div>', cancel + button("确定", modal.danger ? "danger" : "primary", "modal-confirm"), "sm");
          }
          if (modal.type === "followup-rule-preview") {
            var previewRule = modal.rule || followupRules[0];
            var previewBody = '<div class="ops-safety-copy"><strong>规则命中 → 自动创建任务 → 发送患者</strong><span>触发条件：' + escapeHtml(previewRule.trigger) + '</span><span>创建任务：' + escapeHtml(previewRule.task) + '</span><span>发送话术：' + escapeHtml(previewRule.reply) + '</span><span>若患者反馈不适、询问购药结论或超出知识库：自动回复暂停，转人工原因写入会话状态。</span></div>';
            return modalFrame("随访规则链路", previewBody, button("关闭", "", "modal-close"), "sm");
          }
          if (modal.type === "message-detail") {
            var task = messageTasks.filter(function (item) { return item.id === modal.id; })[0] || messageTasks[0];
            var taskStatusClass = task.status === "异常任务" ? "is-red" : task.status === "待执行" ? "is-pending" : task.status === "已取消" ? "is-gray" : task.status === "已完成" ? "is-green" : "";
            var detailRows = [
              { name: "罗先生", phone: "158****7842", status: "已发送", failed: false, reason: "--" },
              { name: "林治", phone: "131****5001", status: "已发送", failed: false, reason: "--" },
              { name: "王丽", phone: "138****2196", status: "发送失败", failed: true, reason: "对方已删除" }
            ].map(function (row) {
              return '<tr><td>' + escapeHtml(row.name) + '</td><td>' + escapeHtml(row.phone) + '</td><td>企业微信</td><td><span class="ops-tag ' + (row.failed ? 'is-red' : 'is-green') + '">' + row.status + '</span></td><td>' + row.reason + '</td></tr>';
            }).join("");
            var details = '<dl class="ops-message-detail-grid"><div class="ops-message-detail-item"><dt>模块</dt><dd>单聊群发</dd></div><div class="ops-message-detail-item"><dt>发送状态</dt><dd><span class="ops-tag ops-message-status-tag ' + taskStatusClass + '">' + escapeHtml(task.status) + '</span></dd></div><div class="ops-message-detail-item"><dt>发送类型</dt><dd>' + escapeHtml(task.sendType) + '</dd></div><div class="ops-message-detail-item"><dt>发送时间</dt><dd>' + escapeHtml(task.sentAt) + '</dd></div><div class="ops-message-detail-item"><dt>创建者</dt><dd>' + escapeHtml(task.creator) + '</dd></div><div class="ops-message-detail-item"><dt>目标总数</dt><dd>' + task.target + '</dd></div><div class="ops-message-detail-item"><dt>群发对象</dt><dd>' + renderTagAudience(task.audience) + '</dd></div></dl><h3 class="ops-modal-section-title">发送内容</h3><div class="ops-message-detail-content">' + escapeHtml(task.content) + '</div><h3 class="ops-modal-section-title">发送对象明细</h3><div class="ops-message-detail-table"><table class="ops-table"><thead><tr><th>患者姓名</th><th>手机号</th><th>推送渠道</th><th>推送状态</th><th>失败原因</th></tr></thead><tbody>' + detailRows + '</tbody></table></div>';
            return modalFrame("任务详情", details, button("失败消息重发", "primary", "message-detail-retry") + button("关闭", "", "modal-close"), "xl");
          }
          if (modal.type === "disease") {
            return modalFrame("添加疾病", '<label class="ops-field"><span class="ops-field-label"><span class="ops-required">*</span>疾病名称</span><input data-initial-focus data-modal="diseaseName" value="' + escapeHtml(state.messageDraft.diagnosis) + '" placeholder="请输入疾病名称"></label>', cancel + confirm, "sm");
          }
          if (modal.type === "patient-disease") {
            return modalFrame("添加疾病", '<label class="ops-field"><span class="ops-field-label"><span class="ops-required">*</span>疾病名称</span><input data-initial-focus data-modal="diseaseName" value="' + escapeHtml(state.patientArchiveDraft.diagnosis) + '" placeholder="请输入疾病名称"></label>', cancel + confirm, "sm");
          }
          if (modal.type === "ops-patient-detail") {
            var opsPatient = opsPatients.filter(function (item) { return item.id === modal.id; })[0] || opsPatients[0];
            var userDetail = '<section class="ops-user-detail-section"><h3>基本信息</h3><dl class="ops-user-detail-grid"><div class="ops-user-detail-item"><dt>患者姓名</dt><dd>' + escapeHtml(opsPatient.name) + '</dd></div><div class="ops-user-detail-item"><dt>性别</dt><dd>' + escapeHtml(opsPatient.gender) + '</dd></div><div class="ops-user-detail-item"><dt>年龄</dt><dd>--</dd></div><div class="ops-user-detail-item"><dt>联系电话</dt><dd>' + escapeHtml(opsPatient.phone) + '　<button class="ops-link" type="button" data-action="ops-phone-view">查看</button></dd></div><div class="ops-user-detail-item"><dt>诊断信息</dt><dd>' + escapeHtml(opsPatient.diagnosis) + '</dd></div><div class="ops-user-detail-item"><dt>是否建档</dt><dd><span class="ops-tag ' + (opsPatient.archived ? 'is-green' : 'is-gray') + '">' + (opsPatient.archived ? '已建档' : '未建档') + '</span></dd></div><div class="ops-user-detail-item"><dt>是否上传病历</dt><dd><span class="ops-tag ' + (opsPatient.medical ? 'is-green' : 'is-gray') + '">' + (opsPatient.medical ? '已上传' : '未上传') + '</span></dd></div></dl></section><section class="ops-user-detail-section"><h3>注册信息</h3><dl class="ops-user-detail-grid"><div class="ops-user-detail-item"><dt>首次添加医生</dt><dd><span class="ops-tag">' + escapeHtml(opsPatient.doctor) + '</span></dd></div><div class="ops-user-detail-item"><dt>首次医生所属医院</dt><dd>' + escapeHtml(opsPatient.hospital) + '</dd></div><div class="ops-user-detail-item"><dt>首次加入项目</dt><dd>' + escapeHtml(opsPatient.project) + '</dd></div><div class="ops-user-detail-item"><dt>首次注册场景码</dt><dd>' + escapeHtml(opsPatient.scene) + '</dd></div></dl><p class="ops-user-scene-title">当前全部医生与场景码（一一对应）</p><div class="ops-modal-table"><table class="ops-table"><thead><tr><th>序号</th><th>医生</th><th>对应场景码</th><th>所属项目</th><th>添加时间</th><th>操作</th></tr></thead><tbody><tr><td>1</td><td><span class="ops-tag">' + escapeHtml(opsPatient.doctor) + '</span></td><td>' + escapeHtml(opsPatient.scene) + '　<span class="ops-tag is-pending">当前使用</span></td><td>' + escapeHtml(opsPatient.project) + '</td><td>2026-09-04 14:01:25</td><td><button class="ops-link" type="button" data-action="ops-scene-view">查看渠道码</button></td></tr></tbody></table></div><dl class="ops-user-detail-grid is-two-column" style="margin-top:20px"><div class="ops-user-detail-item"><dt>注册时间</dt><dd>' + escapeHtml(opsPatient.registered) + '</dd></div><div class="ops-user-detail-item"><dt>最新登录时间</dt><dd>' + escapeHtml(opsPatient.login) + '</dd></div></dl></section>';
            return modalFrame("用户详情", userDetail, button("关闭", "", "modal-close"), "xl");
          }
          if (modal.type === "transfer") {
            var context=modal.context||getHandoffContext();
            return modalFrame(modal.mode==='ai'?'AI转医助':'转接',(modal.group?'<p class="ops-inbox-transfer-scope">仅转交 '+escapeHtml(chatInboxSpeaker(chatInboxSelected(),conversationInbox.store.getSubject(modal.subjectId).speakerId))+' 的当前事项</p>':'')+window.PatientHandoffs.form(context,modal,handoffSummary(context)),cancel+button('确认转接','primary','modal-save'),'sm');
          }
          if (modal.type === "member-view") {
            var row = memberRows.filter(function (item) { return item.id === modal.id; })[0] || memberRows[0];
            var rows = row.doctors.length ? row.doctors.map(function (name, index) {
              var doctor = doctorOptions.filter(function (item) { return item.name === name; })[0] || doctorOptions[index % doctorOptions.length];
              return '<tr><td class="ops-cell-strong">' + escapeHtml(name) + '</td><td>' + escapeHtml(doctor.phone) + '</td><td>' + escapeHtml(doctor.hospital) + '</td><td>' + escapeHtml(doctor.department) + '</td><td>' + escapeHtml(doctor.title) + "</td></tr>";
            }).join("") : '<tr><td colspan="5"><div class="ops-empty">暂未分配医生</div></td></tr>';
            return modalFrame("查看已分配医生", '<div class="ops-modal-summary"><span><small>接待成员</small><br><strong>' + escapeHtml(row.assistant) + '</strong></span><span><small>所属项目</small><br><strong>' + escapeHtml(row.project) + '</strong></span></div><div class="ops-modal-table"><table class="ops-table"><thead><tr><th>医生姓名</th><th>手机号码</th><th>所属医院</th><th>科室</th><th>职称</th></tr></thead><tbody>' + rows + "</tbody></table></div>", button("关闭", "", "modal-close"), "lg");
          }
          if (modal.type === "member-add" || modal.type === "member-adjust") {
            var editing = modal.type === "member-adjust";
            var member = editing ? memberRows.filter(function (item) { return item.id === modal.id; })[0] : null;
            var selectedDoctors = member ? member.doctors : [];
            var doctorList = doctorOptions.map(function (doctor) {
              return '<tr><td><input style="width:18px;height:18px" type="checkbox" data-modal-doctor="' + doctor.id + '" ' + (selectedDoctors.indexOf(doctor.name) >= 0 ? "checked" : "") + ' aria-label="选择' + escapeHtml(doctor.name) + '"></td><td class="ops-cell-strong">' + escapeHtml(doctor.name) + '</td><td>' + escapeHtml(doctor.phone) + '</td><td>' + escapeHtml(doctor.hospital) + '</td><td>' + escapeHtml(doctor.department) + '</td><td>' + escapeHtml(doctor.title) + "</td></tr>";
            }).join("");
            var transferControl = '<div class="ops-field"><span class="ops-field-label">可被转接</span><div class="ops-inline-actions"><button class="ops-switch ' + (state.memberTransferOn ? "is-on" : "") + '" type="button" role="switch" aria-checked="' + (state.memberTransferOn ? "true" : "false") + '" aria-label="可被转接" data-action="member-transfer-toggle"></button><strong>' + (state.memberTransferOn ? "可转接" : "不可转接") + '</strong></div></div>';
            var assistantList = assistantOptions.map(function (assistant) {
              return '<button class="ops-member-assistant-option" type="button" role="option" aria-selected="false" data-action="member-assistant-select" data-value="' + escapeHtml(assistant.name) + '" data-account="' + escapeHtml(assistant.account) + '" data-phone="' + escapeHtml(assistant.phone) + '"><span class="ops-member-assistant-option-name">' + escapeHtml(assistant.name) + '</span><span class="ops-member-assistant-option-meta">账号：' + escapeHtml(assistant.account) + '　手机号：' + escapeHtml(assistant.phone) + '</span></button>';
            }).join("");
            var config = editing
              ? '<div class="ops-modal-summary"><span><small>医助账号</small><br><strong>' + escapeHtml(member.assistant) + '</strong></span><span><small>当前接待人数</small><br><strong>' + member.current + '</strong></span></div><div class="ops-form-grid"><label class="ops-field"><span class="ops-field-label"><span class="ops-required">*</span>最大接待人数</span><input data-initial-focus type="number" data-modal="max" value="' + member.max + '"></label>' + transferControl + '</div>'
              : '<h3 class="ops-modal-section-title">基础配置</h3><div class="ops-form-grid"><div class="ops-field"><span class="ops-field-label"><span class="ops-required">*</span>医助姓名</span><div class="ops-member-assistant-picker"><input type="hidden" data-modal="assistant" value=""><button class="ops-member-assistant-trigger" data-initial-focus type="button" role="combobox" aria-expanded="false" aria-haspopup="listbox" aria-controls="ops-member-assistant-options" data-action="member-assistant-toggle"><span class="ops-member-assistant-value"><span class="ops-member-assistant-placeholder">请选择医助姓名</span></span>' + icon("fa-chevron-down") + '</button><div class="ops-member-assistant-options" id="ops-member-assistant-options" role="listbox" hidden>' + assistantList + '</div></div></div>' + transferControl + '<label class="ops-field"><span class="ops-field-label"><span class="ops-required">*</span>最大接待人数</span><input type="number" data-modal="max" value="" placeholder="请输入最大接待人数"></label></div>';
            var doctorHeading = editing ? "已分配医生" : '托管医生账号<span class="ops-required">*</span>';
            var form = config + '<h3 class="ops-modal-section-title" style="margin-top:20px">' + doctorHeading + '</h3><div class="ops-recipient-tools"><label class="ops-search-shell ops-member-doctor-search" style="width:min(360px,100%)">' + icon("fa-magnifying-glass") + '<input placeholder="搜索医生姓名"></label><strong>已选择 ' + selectedDoctors.length + ' 名医生</strong></div><div class="ops-modal-table"><table class="ops-table"><thead><tr><th></th><th>医生姓名</th><th>手机号码</th><th>所属医院</th><th>科室</th><th>职称</th></tr></thead><tbody>' + doctorList + "</tbody></table></div>";
            return modalFrame(editing ? "调整分配" : "新增成员分配", form, cancel + button(editing ? "确认调整" : "确认添加", "primary", "modal-save"), "xl");
          }
          if (modal.type === "member-batch") {
            var batchTransfer = '<button class="ops-switch ' + (state.memberTransferOn ? "is-on" : "") + '" type="button" role="switch" aria-checked="' + (state.memberTransferOn ? "true" : "false") + '" aria-label="可被转接" data-action="member-transfer-toggle"></button><strong>' + (state.memberTransferOn ? "可转接" : "不可转接") + '</strong>';
            return modalFrame("批量修改分配", '<div class="ops-info-strip" style="margin-bottom:16px">' + icon("fa-circle-info") + '<span>已选择 ' + state.selectedMembers.length + ' 名医助，修改将同步应用于所选医助。</span></div><div class="ops-form-grid" style="grid-template-columns:1fr"><label class="ops-field"><span class="ops-field-label"><span class="ops-required">*</span>最大接待数</span><input data-initial-focus data-modal="max" type="number" value="80"></label><div class="ops-form-divider"></div><div class="ops-field"><span class="ops-field-label">可被转接</span><div class="ops-inline-actions">' + batchTransfer + '</div></div></div>', cancel + button("确认修改", "primary", "modal-save"), "sm");
          }
          return "";
        }

        function renderRoute(route) {
          if (route === "home") return renderHomePage();
          if (route === "patient-archives") return renderPatientArchivesPage();
          if (route === "patient-archive-detail") return renderPatientArchiveDetailPage();
          if (route === "tag-management") return renderLabelPage();
          if (route === "aggregate-chat") return renderChatPage();
          if (route === "my-todos") return renderDoctorTodosPage();
          if (route === "member-assignment") return renderMemberAssignmentPage();
          if (route === "materials") return renderMaterialsPage();
          if (route === "material-create") return renderMaterialFormPage();
          if (route === "material-detail") return renderMaterialDetailPage();
          if (route === "message-tasks") return renderMessageListPage();
          if (route === "message-task-create") return renderMessageTaskCreatePage();
          if (route === "followup-rules") return renderFollowupRulesPage();
          if (route === "care-entry") return renderCareEntryPage();
          if (route === "ops-patients") return renderOpsPatientsPage();
          return "";
        }

        function focusArchiveDetailTop(root) {
          if (!root) return;
          var detail = root.querySelector('.cp-timeline-detail');
          var tabNode = root.querySelector('.cp-tabs-wrap,.ops-patient-detail-tabs');
          var panel = (detail && (detail.closest('.cp-panel') || detail.closest('.ops-patient-record-card'))) || (tabNode && (tabNode.closest('.cp-panel') || tabNode.closest('.ops-patient-record-card')));
          var tabs = panel && panel.querySelector('.cp-tabs-wrap,.ops-patient-detail-tabs');
          if (!tabs) return;
          var scroller = (detail && detail.closest('.ops-profile-page,.ops-modal-body,.ops-patient-detail-scroll')) || panel.closest('.ops-profile-page,.ops-modal-body,.ops-patient-detail-scroll');
          if (!scroller) return;
          if (!tabs) return;
          scroller.scrollTop = 0;
          var bounds = scroller.getBoundingClientRect();
          var scale = scroller.offsetHeight ? bounds.height / scroller.offsetHeight : 1;
          var stickyOffset = parseFloat(window.getComputedStyle(tabs).top) || 0;
          if(detail) detail.style.minHeight = Math.max(0, scroller.clientHeight - stickyOffset - tabs.offsetHeight) + 'px';
          scroller.scrollTop = Math.max(0, (tabs.getBoundingClientRect().top - bounds.top) / (scale || 1) - scroller.clientTop - stickyOffset);
        }
        function updateArchiveLayout() {
          if (!shell) return;
          shell.querySelectorAll('.cp-panel').forEach(function (panel) {
            var scroller=panel.closest('.ops-modal-body, .ops-profile-page');
            var page=panel.closest('.ops-profile-page'), navigation=page && page.querySelector('.cp-page-navigation');
            var tabs=panel.querySelector('.cp-tabs-wrap');
            panel.style.setProperty('--cp-sticky-offset',(navigation ? navigation.getBoundingClientRect().height : 0)+'px');
            if(scroller && scroller.clientHeight) panel.style.setProperty('--cp-scroll-height',scroller.clientHeight+'px');
            if(tabs) panel.style.setProperty('--cp-tabs-height',tabs.getBoundingClientRect().height+'px');
          });
          shell.querySelectorAll('.hm-panel').forEach(function(panel){
            var archive=panel.closest('.cp-panel'),card=panel.closest('.ops-patient-record-card');
            var primary=archive?archive.querySelector('.cp-tabs-wrap'):card&&card.querySelector('.ops-patient-detail-tabs');
            var offset=archive?(parseFloat(archive.style.getPropertyValue('--cp-sticky-offset'))||0):0;
            var owner=panel.closest('.ops-profile-page,.ops-patient-detail-scroll,.ops-modal-body');
            panel.style.setProperty('--hm-sticky-offset',(offset+(primary?primary.getBoundingClientRect().height:0))+'px');
            panel.style.setProperty('--hm-nav-height',panel.querySelector('.hm-nav').getBoundingClientRect().height+'px');
            if(owner&&owner.clientHeight)panel.style.setProperty('--hm-scroll-height',owner.clientHeight+'px');
          });
          shell.querySelectorAll('.fu-panel').forEach(function(panel){
            var archive=panel.closest('.cp-panel'),card=panel.closest('.ops-patient-record-card');
            var primary=archive?archive.querySelector('.cp-tabs-wrap'):card&&card.querySelector('.ops-patient-detail-tabs');
            var offset=archive?(parseFloat(archive.style.getPropertyValue('--cp-sticky-offset'))||0):0;
            panel.style.setProperty('--fu-sticky-offset',(offset+(primary?primary.getBoundingClientRect().height:0))+'px');
            var trigger=panel.querySelector('.fu-record-switch');
            if(trigger)panel.style.setProperty('--fu-switch-height',trigger.getBoundingClientRect().height+'px');
          });
          if(window.ChatPatientArchive.updateScrollHints)window.ChatPatientArchive.updateScrollHints(shell);
        }
        function render(options) {
          if(inboxCompositionNode&&inboxCompositionNode.isConnected&&document.activeElement===inboxCompositionNode){inboxRenderDeferred=true;return;}
          var chatFocus=null,chatScroll=null,oldChatScope=state.chatConversationSelectedKey;
          if(options&&options.preserveChatInput&&shell){var active=document.activeElement;if(active&&shell.contains(active)&&active.matches('input[data-bind^="chat."],textarea[data-bind^="chat."],.ops-modal input[data-modal],.ops-modal textarea[data-modal]')){var field=active.getAttribute('data-bind')||active.getAttribute('data-modal');chatFocus={field:field,attribute:active.hasAttribute('data-bind')?'data-bind':'data-modal',value:field==='chat.draft'?state.chatDraft:active.value,start:active.selectionStart,end:active.selectionEnd,direction:active.selectionDirection,draftScope:state.chatDraftScope,conversationKey:oldChatScope};}}
          if(options&&options.preserveChatScroll&&shell){var oldThread=shell.querySelector('#ops-chat-thread');if(oldThread)chatScroll=oldThread.scrollTop;}
          var archiveScrollPositions=[];
          var materialScrollTop=null;
          var materialTypeScrollLeft=null;
          if(options && options.preserveArchiveScroll && shell) {
            ['.ops-profile-page','.ops-modal-body','.ops-patient-detail-scroll'].forEach(function(selector){
              var scroller=shell.querySelector(selector), tabs=scroller && scroller.querySelector('.cp-tabs-wrap,.ops-patient-detail-tabs');
              if(!scroller)return;
              if(!tabs){archiveScrollPositions.push({selector:selector,top:scroller.scrollTop});return;}
              var panel=tabs.closest('.cp-panel'), offset=panel ? (parseFloat(panel.style.getPropertyValue('--cp-sticky-offset'))||0) : (parseFloat(window.getComputedStyle(tabs).top)||0);
              archiveScrollPositions.push({selector:selector,top:scroller.scrollTop,stuck:scroller.scrollTop>0 && tabs.getBoundingClientRect().top<=scroller.getBoundingClientRect().top+offset+1});
            });
          }
          if(options && options.preserveMaterialScroll && shell) {
            var materialScroller=shell.querySelector('.ops-quick-reply-page .qr-content') || shell.querySelector('.ops-chat-workbench') || shell.querySelector('.ops-page-scroll');
            if(materialScroller) materialScrollTop=materialScroller.scrollTop;
            var materialTypeScroller=shell.querySelector('.ops-quick-reply-page.ops-chat-workbench .ops-material-type-tabs');
            if(materialTypeScroller) materialTypeScrollLeft=materialTypeScroller.scrollLeft;
          }
          window.PatientHandoffs.syncMembers(memberRows);
          var route = currentRoute();
          var legacyPanels = document.querySelectorAll("#root .sidebar, #root .workspace");
          if (!isOpsRoute(route)) {
            if(window.WorkbenchTabs)window.WorkbenchTabs.mount(null);
            if (shell) shell.remove();
            shell = null;
            document.body.classList.remove("ops-route-active");
            legacyPanels.forEach(function (panel) {
              panel.inert = false;
              panel.removeAttribute("aria-hidden");
            });
            document.title = "卓睦鸟患管平台 · 交互原型";
            enhanceNativeSidebar();
            return;
          }
          document.body.classList.add("ops-route-active");
          legacyPanels.forEach(function (panel) {
            panel.inert = true;
            panel.setAttribute("aria-hidden", "true");
          });
          if (!shell || !document.body.contains(shell)) {
            shell = document.createElement("div");
            shell.id = "ops-shell";
            document.body.appendChild(shell);
          }
          shell.innerHTML = renderSidebar(route) + '<main class="ops-workspace">' + renderPageTabs(route) + renderRoute(route) + "</main>" + renderModal() + (state.toast ? '<div class="ops-toast" role="status">' + icon("fa-circle-check") + "<span>" + escapeHtml(state.toast) + "</span></div>" : "");
          if(chatFocus){var sameScope=chatFocus.field==='chat.draft'?chatFocus.draftScope===state.chatDraftScope:chatFocus.attribute==='data-modal'?chatFocus.conversationKey===state.chatConversationSelectedKey:true;var restored=Array.from(shell.querySelectorAll('input,textarea')).find(function(n){return n.getAttribute(chatFocus.attribute)===chatFocus.field;});if(sameScope&&restored){restored.value=chatFocus.value;restored.focus({preventScroll:true});if(typeof chatFocus.start==='number'&&restored.setSelectionRange)try{restored.setSelectionRange(chatFocus.start,chatFocus.end,chatFocus.direction);}catch(error){}}}
          if (window.PrototypeSelect) window.PrototypeSelect.enhance(shell);
          window.PrototypeDateTime.enhance(shell);
          if(window.WorkbenchTabs)window.WorkbenchTabs.mount(shell);
          updateArchiveLayout();
          window.ChatPatientArchive.mountScrollHints(shell);
          window.ChatPatientArchive.mountTimelineUploads(shell,function(){
            var conversation=selectedChatConversation();
            return window.ChatPatientArchive.context(conversation,state.chatDoctorSelected,state.chatArchiveScene);
          },function(){
            if(!shell||!shell.querySelector('.cp-panel'))return;
            // Keep an open edit draft when an upload finishes in the background.
            var form=shell.querySelector('[data-edit-form]'),draft=form?{date:form.querySelector('[name="visitDate"]').value,content:form.querySelector('[name="visitContent"]').value}:null;
            render({preserveArchiveScroll:true});
            var nextForm=draft&&shell.querySelector('[data-edit-form]');
            if(nextForm){nextForm.querySelector('[name="visitDate"]').value=draft.date;nextForm.querySelector('[name="visitContent"]').value=draft.content;}
          });
          window.PatientFollowups.mount(function(){render({preserveArchiveScroll:true});});
          if(window.ImagePreview)window.ImagePreview.mount(shell);
          if(window.PatientDiagnoses)window.PatientDiagnoses.mount(shell,function(key,summary){
            // Update legacy back-office summary only for this exact archive context.
            // Original patient wording remains in the diagnosis model.
            patientArchives.forEach(function(patient){if(patientArchiveKey(patient)===key)patient.diagnosis=summary;});
          });
          archiveScrollPositions.forEach(function(position){
            var scroller=shell.querySelector(position.selector), tabs=scroller && scroller.querySelector('.cp-tabs-wrap,.ops-patient-detail-tabs');
            if(!scroller)return;
            if(!tabs){scroller.scrollTop=position.top;return;}
            if(options.archiveTabChanged) {
              var panel=tabs.closest('.cp-panel'), offset=panel ? (parseFloat(panel.style.getPropertyValue('--cp-sticky-offset'))||0) : (parseFloat(window.getComputedStyle(tabs).top)||0);
              scroller.scrollTop=Math.max(0,tabs.getBoundingClientRect().top-scroller.getBoundingClientRect().top-offset);
            } else scroller.scrollTop=position.top;
          });
          if(materialScrollTop!==null){
            var restoredMaterialScroller=shell.querySelector('.ops-quick-reply-page .qr-content') || shell.querySelector('.ops-chat-workbench') || shell.querySelector('.ops-page-scroll');
            if(restoredMaterialScroller) restoredMaterialScroller.scrollTop=materialScrollTop;
          }
          if(materialTypeScrollLeft!==null){
            var restoredMaterialTypeScroller=shell.querySelector('.ops-quick-reply-page.ops-chat-workbench .ops-material-type-tabs');
            if(restoredMaterialTypeScroller){restoredMaterialTypeScroller.scrollLeft=materialTypeScrollLeft;updateChatMaterialTypeScrollCue(restoredMaterialTypeScroller);}
          }
          document.title = (aiSummaryStandalone ? "AI小结" : quickRepliesStandalone ? "快捷回复" : patientFollowupsStandalone ? "患者跟进" : ROUTES[route].label) + " · 卓睦鸟患管平台";
          maybeAutoGenerateChatAiSummary();
          window.requestAnimationFrame(function () {
            if (!shell || !isOpsRoute()) return;
            var thread = document.getElementById("ops-chat-thread");
            if(thread)thread.scrollTop=chatScroll!==null&&oldChatScope===state.chatConversationSelectedKey?chatScroll:thread.scrollHeight;
            if(materialScrollTop!==null){
              var rafMaterialScroller=shell.querySelector('.ops-quick-reply-page .qr-content') || shell.querySelector('.ops-chat-workbench') || shell.querySelector('.ops-page-scroll');
              if(rafMaterialScroller) rafMaterialScroller.scrollTop=materialScrollTop;
            }
            var rafMaterialTypeScroller=shell.querySelector('.ops-quick-reply-page.ops-chat-workbench .ops-material-type-tabs');
            if(rafMaterialTypeScroller){
              if(materialTypeScrollLeft!==null)rafMaterialTypeScroller.scrollLeft=materialTypeScrollLeft;
              updateChatMaterialTypeScrollCue(rafMaterialTypeScroller);
            }
            filterChatDoctors(state.chatDoctorSearch);
            filterChatConversations();
            filterChatMaterials(state.chatMaterialSearch);
            filterPatientArchiveTagOptions(state.patientArchiveTagSearch);
            window.ChatPatientArchive.centerActiveTabs(shell);
            if(options && options.focusArchiveDetail) focusArchiveDetailTop(shell);
          });
        }

        function findMaterialById(id) {
          var result = null;
          Object.keys(materials).some(function (scope) {
            result = materials[scope].filter(function (item) { return item.id === id; })[0] || null;
            return !!result;
          });
          return result;
        }

        function readModalValue(key) {
          var field = shell && shell.querySelector('[data-modal="' + key + '"]');
          return field ? field.value.trim() : "";
        }

        function syncHealthEntryModal() {
          var root = shell && shell.querySelector('[data-health-entry]');
          if (root && state.modal && state.modal.type === "health-add" && window.PatientHealth.captureEntryState) window.PatientHealth.captureEntryState(root, state.modal);
          return root;
        }

        function updateHealthEntryModalProgress() {
          var root = shell && shell.querySelector('[data-health-entry]');
          if (!root || !state.modal || state.modal.type !== "health-add" || !window.PatientHealth.collectEntry) return;
          var result = window.PatientHealth.collectEntry(root), labels = shell.querySelectorAll('[data-entry-progress],[data-entry-completed]'), selected = root.querySelectorAll('[data-entry-metric][aria-pressed="true"]').length, selectionLabel = shell.querySelector('[data-entry-selected]'), save = shell.querySelector('[data-action="modal-save"]');
          Array.prototype.forEach.call(labels, function (label) { label.textContent = "已完成 " + result.completedCount + " 条记录"; });
          if (selectionLabel) selectionLabel.textContent = "已选 " + selected + " 项";
          if (save) save.disabled = result.completedCount < 1;
        }

        function filterPatientTagOptions(value) {
          var dropdown = shell && shell.querySelector('[data-patient-tag-options]');
          var input = shell && shell.querySelector('[data-modal="patientTag"]');
          if (!dropdown || !input || !state.modal) return;
          state.modal.patientTagSearch = value;
          // Replace only results so Chinese input composition and cursor stay intact.
          var template = document.createElement('template');
          template.innerHTML = renderModal();
          dropdown.replaceWith(template.content.querySelector('[data-patient-tag-options]'));
          var pager = shell.querySelector('.ops-patient-tag-pager');
          if (pager) pager.replaceWith(template.content.querySelector('.ops-patient-tag-pager'));
          input.setAttribute('aria-expanded', 'true');
        }

        function filterPatientArchiveTagOptions(value) {
          var dropdown = shell && shell.querySelector("[data-patient-archive-tag-options]");
          var input = shell && shell.querySelector('[data-bind="patient.tagSearch"]');
          if (!dropdown || !input) return;
          var query = String(value || "").trim().toLowerCase();
          var visibleCount = 0;
          Array.prototype.forEach.call(dropdown.querySelectorAll("[data-patient-archive-tag-option]"), function (option) {
            var name = (option.getAttribute("data-tag-name") || "").toLowerCase();
            var matched = !query || name.indexOf(query) >= 0;
            option.hidden = !matched;
            if (matched) visibleCount += 1;
          });
          var empty = dropdown.querySelector("[data-patient-archive-tag-empty]");
          dropdown.hidden = !state.patientArchiveTagOpen;
          input.setAttribute("aria-expanded", state.patientArchiveTagOpen ? "true" : "false");
          if (empty) empty.hidden = visibleCount > 0;
        }

        function refreshPatientArchiveTagSelector() {
          var query = state.patientArchiveTagSearch || "";
          render();
          window.requestAnimationFrame(function () {
            var input = shell && shell.querySelector('[data-bind="patient.tagSearch"]');
            if (!input) return;
            filterPatientArchiveTagOptions(query);
            input.focus();
            input.setSelectionRange(input.value.length, input.value.length);
          });
        }

        function selectPatientArchiveTag(name) {
          if (!name) return;
          var tags = Array.isArray(state.patientArchiveDraft.tags) ? state.patientArchiveDraft.tags : [];
          var index = tags.indexOf(name);
          if (index >= 0) tags.splice(index, 1);
          else tags.push(name);
          state.patientArchiveDraft.tags = tags;
          state.patientArchiveTagOpen = true;
          refreshPatientArchiveTagSelector();
        }

        function refreshPatientTagModal() {
          var isTagModal = state.modal && (state.modal.type === "chat-patient-tags" || state.modal.type === "patient-archive-tags");
          var query = isTagModal ? state.modal.patientTagSearch || "" : "";
          render();
          window.requestAnimationFrame(function () {
            var input = shell && shell.querySelector('[data-modal="patientTag"]');
            if (!input) return;
            filterPatientTagOptions(query);
            input.focus();
          });
        }

        function selectPatientTag(name) {
          var modal = state.modal;
          if (!modal || (modal.type !== "chat-patient-tags" && modal.type !== "patient-archive-tags")) return;
          if (!name) {
            toast("请选择标签名称");
            return;
          }
          var index = modal.tags.indexOf(name);
          if (index >= 0) {
            modal.tags.splice(index, 1);
            refreshPatientTagModal();
            return;
          }
          if (modal.tags.length >= 10) {
            toast("最多选择 10 个患者标签");
            window.requestAnimationFrame(function () {
              var input = shell && shell.querySelector('[data-modal="patientTag"]');
              if (!input) return;
              filterPatientTagOptions(modal.patientTagSearch || "");
              input.focus();
            });
            return;
          }
          modal.tags.push(name);
          refreshPatientTagModal();
        }

        function openMaterialGroupManager(scope, parent, fromForm, trigger) {
          var sourceGroups=(state.materialGroupOrder[scope]||[]).slice();
          openModal({type:"material-groups",scope:scope,originalGroups:sourceGroups.slice(),groups:sourceGroups.map(function(name){return {original:name,name:name};}),newGroup:"",parent:parent||null,fromMaterialForm:!!fromForm},trigger);
        }

        function clearMaterialGroupHighlight(modal) {
          if (!modal) return;
          if (modal.highlightTimer) window.clearTimeout(modal.highlightTimer);
          delete modal.highlightTimer;delete modal.highlightedGroup;
          if (state.modal === modal && shell) shell.querySelectorAll('.ops-group-manager-row.is-new-group').forEach(function(row){row.classList.remove('is-new-group');});
        }
        function revealMaterialGroup(modal, group) {
          if (state.modal !== modal || modal.groupEditor || modal.highlightedGroup !== group || !shell) return;
          var index=modal.groups.indexOf(group),row=shell.querySelector('[data-material-manager-index="'+index+'"]'),scroller=shell.querySelector('.ops-modal.is-group-manager .ops-modal-body');
          if (!row || !scroller || !document.body.contains(row)) return;
          // Focus the result, not an input: mobile users can see the newly added
          // row without reopening the keyboard or jumping back to the create bar.
          row.focus({preventScroll:true});
          var bounds=scroller.getBoundingClientRect(),rowBounds=row.getBoundingClientRect(),top=bounds.top+12;
          if(rowBounds.bottom>bounds.bottom-12)scroller.scrollTop+=rowBounds.bottom-bounds.bottom+12;
          else if(rowBounds.top<top)scroller.scrollTop-=top-rowBounds.top;
        }
        function positionMaterialGroupEditor() {
          var panel=shell&&shell.querySelector('.ops-group-editor-backdrop'),viewport=window.visualViewport;
          if(panel&&viewport){panel.style.top=viewport.offsetTop+'px';panel.style.height=viewport.height+'px';panel.style.bottom='auto';}
        }
        function openMaterialGroupEditor() {
          var modal=state.modal;if(!modal||modal.type!=='material-groups'||modal.groupEditor)return;
          cancelMaterialManagerPointerDrag();
          var scroller=shell&&shell.querySelector('.ops-modal.is-group-manager .ops-modal-body');
          modal.groupEditor={scrollTop:scroller?scroller.scrollTop:0,error:''};modal.newGroup='';
          render();scroller=shell&&shell.querySelector('.ops-modal.is-group-manager .ops-modal-body');if(scroller)scroller.scrollTop=modal.groupEditor.scrollTop;
          window.requestAnimationFrame(function(){if(state.modal!==modal||!modal.groupEditor)return;positionMaterialGroupEditor();var input=shell&&shell.querySelector('[data-modal="newGroupDialog"]');if(input)input.focus({preventScroll:true});});
        }
        function cancelMaterialGroupEditor() {
          var modal=state.modal;if(!modal||modal.type!=='material-groups'||!modal.groupEditor)return;
          var scrollTop=modal.groupEditor.scrollTop;modal.groupEditor=null;modal.newGroup='';render();
          var scroller=shell&&shell.querySelector('.ops-modal.is-group-manager .ops-modal-body');if(scroller)scroller.scrollTop=scrollTop;
          var trigger=shell&&shell.querySelector('[data-action="material-group-new"]');if(trigger)trigger.focus({preventScroll:true});
        }
        function materialGroupCreateError(message) {
          var modal=state.modal;
          if(modal&&modal.groupEditor){modal.groupEditor.error=message;var feedback=shell&&shell.querySelector('.ops-group-editor-error');if(feedback){feedback.hidden=false;feedback.setAttribute('role','alert');feedback.textContent=message;}var field=shell&&shell.querySelector('[data-modal="newGroupDialog"]');if(field)field.focus({preventScroll:true});return;}
        }

        function moveMaterialManagerGroup(fromIndex,toIndex) {
          var modal=state.modal;
          if(!modal||modal.type!=="material-groups"||modal.groupEditor||fromIndex<0||toIndex<0||fromIndex>=modal.groups.length||toIndex>=modal.groups.length||fromIndex===toIndex)return;
          var scroller=shell&&shell.querySelector('.ops-modal.is-group-manager .ops-modal-body');
          var scrollTop=scroller?scroller.scrollTop:0;
          var group=modal.groups.splice(fromIndex,1)[0];modal.groups.splice(toIndex,0,group);delete modal.dragIndex;
          render();
          scroller=shell&&shell.querySelector('.ops-modal.is-group-manager .ops-modal-body');if(scroller)scroller.scrollTop=scrollTop;
          var handle=shell&&shell.querySelector('[data-material-manager-drag="'+toIndex+'"]');if(handle)handle.focus({preventScroll:true});
        }

        var materialManagerPointerDrag=null;
        function markMaterialManagerDrop(drag) {
          if(!shell)return;
          var rows=Array.prototype.slice.call(shell.querySelectorAll('[data-material-manager-index]'));
          var nearest=null,distance=Infinity;
          rows.forEach(function(row){
            row.classList.remove('is-drag-over');
            var bounds=row.getBoundingClientRect(),gap=Math.abs(drag.y-(bounds.top+bounds.height/2));
            if(gap<distance){nearest=row;distance=gap;}
          });
          if(nearest){drag.to=Number(nearest.getAttribute('data-material-manager-index'));if(drag.to!==drag.from)nearest.classList.add('is-drag-over');}
        }
        function scrollMaterialManagerDrag() {
          var drag=materialManagerPointerDrag;
          if(!drag||!drag.moved)return;
          if(state.modal!==drag.modal||!document.body.contains(drag.handle)){cancelMaterialManagerPointerDrag();return;}
          var bounds=drag.scroller.getBoundingClientRect();
          var delta=drag.y<bounds.top+40?-8:drag.y>bounds.bottom-40?8:0;
          if(delta){drag.scroller.scrollTop+=delta;markMaterialManagerDrop(drag);}
          drag.frame=window.requestAnimationFrame(scrollMaterialManagerDrag);
        }
        function cancelMaterialManagerPointerDrag() {
          var drag=materialManagerPointerDrag;
          if(!drag)return;
          materialManagerPointerDrag=null;
          if(drag.frame)window.cancelAnimationFrame(drag.frame);
          if(drag.handle.hasPointerCapture&&drag.handle.hasPointerCapture(drag.id))drag.handle.releasePointerCapture(drag.id);
          if(shell)shell.querySelectorAll('.ops-group-manager-row.is-dragging,.ops-group-manager-row.is-drag-over').forEach(function(row){row.classList.remove('is-dragging','is-drag-over');});
        }
        function handleMaterialManagerPointerDown(event) {
          if(event.pointerType!=='touch'&&event.pointerType!=='pen')return;
          var handle=event.target.closest('[data-material-manager-drag]');
          if(!handle||!state.modal||state.modal.type!=='material-groups'||state.modal.groupEditor)return;
          var scroller=handle.closest('.ops-modal-body');if(!scroller)return;
          event.preventDefault();cancelMaterialManagerPointerDrag();
          materialManagerPointerDrag={id:event.pointerId,handle:handle,modal:state.modal,scroller:scroller,from:Number(handle.getAttribute('data-material-manager-drag')),to:Number(handle.getAttribute('data-material-manager-drag')),startY:event.clientY,y:event.clientY,moved:false};
          if(handle.setPointerCapture)handle.setPointerCapture(event.pointerId);
        }
        function handleMaterialManagerPointerMove(event) {
          var drag=materialManagerPointerDrag;
          if(!drag||drag.id!==event.pointerId)return;
          event.preventDefault();drag.y=event.clientY;
          if(!drag.moved&&Math.abs(drag.y-drag.startY)<5)return;
          if(!drag.moved){drag.moved=true;drag.handle.closest('.ops-group-manager-row').classList.add('is-dragging');drag.frame=window.requestAnimationFrame(scrollMaterialManagerDrag);}
          markMaterialManagerDrop(drag);
        }
        function handleMaterialManagerPointerEnd(event) {
          var drag=materialManagerPointerDrag;
          if(!drag||drag.id!==event.pointerId)return;
          var apply=event.type==='pointerup'&&drag.moved&&state.modal===drag.modal;
          cancelMaterialManagerPointerDrag();
          if(apply)moveMaterialManagerGroup(drag.from,drag.to);
        }

        function createMaterialGroup() {
          var modal = state.modal;
          if (!modal || modal.type !== "material-groups" || !modal.groupEditor) return;
          var name = readModalValue("newGroupDialog");
          modal.newGroup = name;
          if (!name) {
            materialGroupCreateError("请输入新分组名称");
            return;
          }
          if (name.length>20 || name==="全部素材" || name==="未分组" || modal.groups.some(function (group) { return group.name.trim() === name; })) {
            materialGroupCreateError("分组名称已存在");
            return;
          }
          clearMaterialGroupHighlight(modal);
          var addedGroup={ original: "", name: name };
          modal.groups.push(addedGroup);
          modal.highlightedGroup=addedGroup;
          modal.groupEditor=null;
          modal.newGroup = "";
          render();
          window.requestAnimationFrame(function () {
            revealMaterialGroup(modal,addedGroup);
          });
          modal.highlightTimer=window.setTimeout(function(){if(modal.highlightedGroup===addedGroup)clearMaterialGroupHighlight(modal);},2000);
        }

        function deleteMaterialGroup(index) {
          var modal = state.modal;
          if (!modal || modal.type !== "material-groups") return;
          if (modal.groups.length <= 1) {
            toast("至少保留一个素材分组");
            return;
          }
          modal.groups.splice(index, 1);
          render();
        }

        function finishMaterialGroupManager() {
          var modal = state.modal;
          if (!modal || modal.type !== "material-groups") return;
          if (shell) {
            shell.querySelectorAll("[data-material-group-index]").forEach(function (field) {
              var index = Number(field.getAttribute("data-material-group-index"));
              if (modal.groups[index]) modal.groups[index].name = field.value;
            });
          }
          var names = modal.groups.map(function (group) { return group.name.trim(); });
          if (names.some(function (name) { return !name || name.length>20 || name==="全部素材" || name==="未分组"; })) {
            toast("请填写完整的分组名称");
            return;
          }
          var uniqueNames = names.filter(function (name, index) { return names.indexOf(name) === index; });
          if (uniqueNames.length !== names.length) {
            toast("分组名称不能重复");
            return;
          }
          clearMaterialGroupHighlight(modal);
          var scope = modal.scope;
          var renamed = {};
          modal.groups.forEach(function (group, index) {
            if (group.original) renamed[group.original] = names[index];
          });
          var retainedOriginals = modal.groups.map(function (group) { return group.original; }).filter(Boolean);
          var removedOriginals = modal.originalGroups.filter(function (name) { return retainedOriginals.indexOf(name) < 0; });
          var fallbackGroup = names[0] || "";
          materials[scope].forEach(function (item) {
            if (renamed[item.group]) item.group = renamed[item.group];
            else if (removedOriginals.indexOf(item.group) >= 0) item.group = fallbackGroup;
          });
          state.materialGroupOrder[scope] = names;
          if (state.materialTab === scope && state.materialGroup !== "全部素材") {
            if (renamed[state.materialGroup]) state.materialGroup = renamed[state.materialGroup];
            else if (removedOriginals.indexOf(state.materialGroup) >= 0) state.materialGroup = "全部素材";
          }
          if (state.materialDraft.scope === scope && state.materialDraft.group) {
            if (renamed[state.materialDraft.group]) state.materialDraft.group = renamed[state.materialDraft.group];
            else if (removedOriginals.indexOf(state.materialDraft.group) >= 0) state.materialDraft.group = fallbackGroup;
          }
          if(modal.fromMaterialForm){
            var createdGroups=modal.groups.filter(function(group){return !group.original;});
            if(createdGroups.length)state.materialDraft.group=createdGroups[createdGroups.length-1].name.trim();
          }
          state.modal = modal.parent || null;
          toast("素材分组已更新");
          if(modal.fromMaterialForm)window.requestAnimationFrame(function(){var trigger=shell&&shell.querySelector('[data-action="material-form-new-group"]');if(trigger)trigger.focus();});
        }

        function saveModal() {
          var modal = state.modal;
          if (!modal) return;
          if (modal.type === "health-add") {
            var entryRoot=syncHealthEntryModal(),entryResult=window.PatientHealth.collectEntry(entryRoot),error=entryResult.error||window.PatientHealth.addBatch(modal.key,entryResult.date,entryResult.entries);
            if(error){var feedback=shell.querySelector('[data-health-error]');feedback.textContent=error;feedback.hidden=false;return;}
            state.modal=null;
            render({preserveArchiveScroll:true});
            var addTrigger=shell.querySelector('[data-action="health-add"]');if(addTrigger)addTrigger.focus();
            return;
          }
          if (modal.type === "chat-patient-tags") {
            state.chatPatientTags[modal.patient] = modal.tags.slice();
            state.modal = null;
            toast("患者标签已更新");
            render({preserveArchiveScroll:true});
            return;
          }
          if (modal.type === "patient-archive-tags") {
            var archivePatient = patientArchives.filter(function (patient) { return patient.id === modal.id; })[0];
            if (archivePatient) archivePatient.tags = modal.tags.slice();
            state.modal = null;
            toast("患者标签已更新");
            render({preserveArchiveScroll:true});
            return;
          }
          if (modal.type.indexOf("label-") === 0) {
            var name = readModalValue("name");
            if (!name) {
              toast("请填写标签名称");
              return;
            }
            if (Array.from(name).length > 15) {
              toast("每级标签名称最多15字");
              return;
            }
            if (modal.type === "label-edit") {
              var editing = labelRows[state.labelTab].filter(function (row) { return row.name === modal.name; })[0];
              if (editing) editing.name = name;
            } else {
              var level = modal.type === "label-level1" ? 1 : modal.type === "label-level2" ? 2 : 3;
              labelRows[state.labelTab].push({ name: name, type: level === 1 ? "一级标签" : level === 2 ? "二级标签" : "标签名称", sort: Number(readModalValue("sort")) || 100, level: level, parent: modal.parent || "" });
            }
            state.modal = null;
            toast("标签已保存");
            return;
          }
          if (modal.type === "disease") {
            var diseaseName = readModalValue("diseaseName");
            if (!diseaseName) {
              toast("请输入疾病名称");
              return;
            }
            state.messageDraft.diagnosis = diseaseName;
            state.modal = null;
            render();
            return;
          }
          if (modal.type === "patient-disease") {
            var patientDiseaseName = readModalValue("diseaseName");
            if (!patientDiseaseName) {
              toast("请输入疾病名称");
              return;
            }
            state.patientArchiveDraft.diagnosis = patientDiseaseName;
            state.modal = null;
            render();
            return;
          }
          if (modal.type === "transfer") {
            if(conversationInbox&&!chatInboxCanOperate()){state.modal=null;render();return;}
            var s=conversationInbox&&conversationInbox.store.getSubject(modal.subjectId);
            if(s&&(s.revision!==modal.subjectRevision||s.lastPatientSeq!==modal.subjectCutoff)){modal.error='事项已有新消息，请重新查看后转接';render();return;}
            var request={requestId:modal.requestId,reason:readModalValue('transferReason'),reasonDetail:readModalValue('transferReasonDetail'),summary:readModalValue('transferSummary')||modal.summary||'',toKind:modal.recipientType||'assistant'},selected=shell.querySelector('[data-modal="transferTo"]:checked');
            var to={kind:request.toKind,id:request.toKind==='ai'?'ai-demo':selected?selected.value:'',name:request.toKind==='ai'?'AI':selected&&selected.closest('label').querySelector('strong').textContent||''};
            if(to.kind!=='ai'&&(!to.id||!request.reason||!request.reasonDetail.trim())){modal.error=!to.id?'请选择转接对象':!request.reason?'请选择转出理由':'请填写理由详情';render();return;}
            if(!modal.group&&window.PatientHandoffs.getRecords(modal.context).some(function(record){return record.status==='pending_reply'||record.status==='return_pending';})){modal.error='已有转接等待回复，请勿重复转接';render();return;}
            if(modal.scopeOnly&&to.kind!=='ai'&&!window.PatientHandoffs.subjectCandidates(modal.context,to.kind,s.assignee&&s.assignee.id).some(function(member){return member.id===to.id;})){modal.error='当前接收人不可接待，请重新选择';render();return;}
            var op=s&&chatInboxBeginTransfer(to,s,modal.requestId);if(op&&!op.ok){modal.error='当前无法转交，请重新查看事项';render();return;}
            var result=modal.group?{ok:true}:modal.mode==='ai'?window.PrototypeAiActions.transfer_to_assistant.invoke(request,modal.context):window.PatientHandoffs.transfer(modal.context,Object.assign({},request,{toId:to.id}),'manual');
            var applied=chatInboxSettle(op,result);
            if(!result.ok||applied&&!applied.applied){modal.error=result.message||'转接未完成，请重新查看事项';var message=shell.querySelector('[data-handoff-error]');if(message)message.textContent=modal.error;return;}
            state.modal=null;state.chatSubjectSelected=null;if(!modal.group)recordChatDispatch(modal.context,modal.requestId);render();toast('已转交该事项');return;
          }
          if (modal.type === "member-add") {
            var assistant = readModalValue("assistant");
            var maxReception = readModalValue("max");
            if (!assistant) {
              toast("请选择医助姓名");
              return;
            }
            if (!maxReception || Number(maxReception) <= 0) {
              toast("请输入有效的最大接待人数");
              return;
            }
            var selectedDoctorNames = Array.prototype.map.call(shell.querySelectorAll("[data-modal-doctor]:checked"), function (field) {
              var doctor = doctorOptions.filter(function (item) { return item.id === field.getAttribute("data-modal-doctor"); })[0];
              return doctor ? doctor.name : "";
            }).filter(Boolean);
            if (!selectedDoctorNames.length) {
              toast("请至少选择一名托管医生");
              return;
            }
            memberRows.push({ id: "m" + (memberRows.length + 1), assistant: assistant, project: "广德慢病项目", doctors: selectedDoctorNames, assigned: true, max: Number(maxReception), current: 0, transferable: state.memberTransferOn });
            state.modal = null;
            toast("成员分配已新增");
            return;
          }
          if (modal.type === "member-adjust") {
            var adjusting = memberRows.filter(function (item) { return item.id === modal.id; })[0];
            if (adjusting) {
              adjusting.max = Number(readModalValue("max")) || adjusting.max;
              adjusting.transferable = state.memberTransferOn;
            }
            state.modal = null;
            toast("分配设置已更新");
            return;
          }
          if (modal.type === "member-batch") {
            state.modal = null;
            toast("已完成批量修改");
          }
        }

        function confirmModalAction() {
          var modal = state.modal;
          if (!modal) return;
          if (modal.confirmAction === "material-delete") {
            materials[state.materialTab] = materials[state.materialTab].filter(function (item) { return item.id !== modal.id; });
          } else if (modal.confirmAction === "label-delete") {
            labelRows[state.labelTab] = labelRows[state.labelTab].filter(function (item) { return item.name !== modal.name && item.parent !== modal.name; });
          } else if (modal.confirmAction === "member-delete") {
            memberRows = memberRows.filter(function (item) { return modal.ids.indexOf(item.id) < 0; });
            state.selectedMembers = [];
          } else if (modal.confirmAction === "message-cancel") {
            var task = messageTasks.filter(function (item) { return item.id === modal.id; })[0];
            if (task) task.status = "已取消";
            state.messageStatus = "已取消";
          }
          state.modal = null;
          toast(modal.success || "操作成功");
        }

        function sendChatMessage() {
          if(!quickRepliesStandalone&&currentRoute()==='aggregate-chat'&&conversationInbox&&!chatInboxCanOperate()){state.modal=null;render();return;}
          var preservedQuickReplyScrollTop = null;
          var quickReplyScrollHost = document.querySelector("html.ops-quick-replies-standalone .ops-quick-reply-page");
          if (quickReplyScrollHost) preservedQuickReplyScrollTop = quickReplyScrollHost.scrollTop;
          if (quickRepliesStandalone && !getChatConversationData().some(function(item){return item.name===state.chatSelected;})) {
            state.modal = null;
            render();
            toast("无法确定当前会话，请从会话入口打开");
            return;
          }
          if(conversationInbox&&inboxSending[state.chatDraftScope])return;
          if(inboxCompositionNode&&inboxCompositionNode.isConnected)return;
          var textValue = state.chatDraft.trim();
          if (!textValue) {
            toast("请输入消息内容");
            return;
          }
          if(conversationInbox){
            var c=chatInboxSelected(),s=chatInboxSubject(),captured={id:s.id,revision:s.revision,seq:s.lastPatientSeq,key:c.key,name:state.chatSelected,legacy:s.legacyRef,draftKey:state.chatDraftScope},messageId='human-message-'+Date.now()+'-'+(++inboxOperationCounter);
            inboxSending[captured.draftKey]=true;render({preserveArchiveScroll:true,preserveChatScroll:true,preserveChatInput:true});
            window.setTimeout(function(){
              var current=conversationInbox.store.getSubject(captured.id);
              if(!current||current.assignee&&current.assignee.id!==conversationInbox.actor.id||!conversationInbox.store.canOperate(captured.id,{action:'complete'})){delete inboxSending[captured.draftKey];toast('事项归属已变化，消息未发送');render();return;}
              var sent=conversationInbox.store.recordMessage({id:messageId,conversationKey:captured.key,speakerId:conversationInbox.actor.id,kind:'human',text:textValue,speakerName:conversationInbox.actor.name,sentAt:Date.now()});
              delete inboxSending[captured.draftKey];
              if(sent.ok){
                if(captured.legacy&&captured.legacy.taskId){var task=window.DoctorReception.assignment(captured.legacy.taskId),latest=window.DoctorReception.latestAssignment({patientId:c.patientId,sceneCode:captured.legacy.sceneCode});if(latest&&!latest.result&&latest.doctorId===conversationInbox.actor.id&&latest.assignedAt>=captured.legacy.assignedAt)task=latest;if(task&&!task.result&&task.doctorId===conversationInbox.actor.id)window.DoctorReception.receiveAssignedReply({tenantId:task.tenantId,taskId:task.id,conversationId:task.conversationId,authorId:conversationInbox.actor.id,kind:'doctor',deliveryStatus:'sent',isPublic:true,messageId:messageId,text:textValue,sentAt:Date.now()});}
                inboxDrafts[captured.draftKey]='';if(state.chatDraftScope===captured.draftKey)state.chatDraft='';
              }else toast('发送失败，请重试');
              render({preserveArchiveScroll:true,preserveChatScroll:true,preserveChatInput:true});
            },180);return;
          }
          var message = { side: "self", name: "租户管理员发送", time: "刚刚", text: textValue };
          if (state.chatSelected !== "王德华") {
            if (!state.chatConversationReplies[state.chatSelected]) state.chatConversationReplies[state.chatSelected] = [];
            state.chatConversationReplies[state.chatSelected].push(message);
          } else state.chatMessages.push(message);
          state.chatDraft = "";
          if (quickRepliesStandalone) quickReplySendStatus = "已模拟发送至" + state.chatSelected;
          if(quickRepliesStandalone&&quickRepliesEmbedded&&archivePageParams.get("host")==="wecom-preview"&&window.parent!==window){
            window.parent.postMessage({type:"wecom-preview-send",patient:state.chatSelected,doctor:state.chatDoctorSelected,scene:state.chatArchiveScene,text:textValue},window.location.origin);
          }
          render();
          if (preservedQuickReplyScrollTop !== null) {
            window.requestAnimationFrame(function () {
              var nextQuickReplyScrollHost = document.querySelector("html.ops-quick-replies-standalone .ops-quick-reply-page");
              if (nextQuickReplyScrollHost) nextQuickReplyScrollHost.scrollTop = preservedQuickReplyScrollTop;
            });
          }
        }

        function filterChatDoctors(value) {
          if (!shell) return;
          var keyword = String(value || "").trim().toLowerCase();
          var visibleCount = 0;
          shell.querySelectorAll("[data-chat-project]").forEach(function (group) {
            var projectMatches = !keyword || (group.getAttribute("data-chat-project") || "").toLowerCase().indexOf(keyword) >= 0;
            var groupVisibleCount = 0;
            group.querySelectorAll("[data-chat-doctor-name]").forEach(function (row) {
              var doctorMatches = (row.getAttribute("data-chat-doctor-name") || "").toLowerCase().indexOf(keyword) >= 0;
              var isVisible = projectMatches || doctorMatches;
              row.hidden = !isVisible;
              if (isVisible) groupVisibleCount += 1;
            });
            group.hidden = groupVisibleCount === 0;
            var expanded = !!keyword || group.getAttribute("data-chat-collapsed") !== "true";
            var list = group.querySelector(".ops-doctor-list");
            var toggle = group.querySelector("[data-action=\"chat-project-toggle\"]");
            var toggleIcon = toggle && toggle.querySelector(".ops-icon");
            if (list) list.hidden = !expanded;
            if (toggle) toggle.setAttribute("aria-expanded", expanded ? "true" : "false");
            if (toggleIcon) {
              toggleIcon.classList.toggle("fa-chevron-down", expanded);
              toggleIcon.classList.toggle("fa-chevron-right", !expanded);
            }
            visibleCount += groupVisibleCount;
          });
          var empty = shell.querySelector("[data-chat-doctor-empty]");
          if (empty) empty.hidden = visibleCount > 0;
        }

        function filterChatConversations() {
          if (!shell) return;
          var keyword = String(state.chatConversationSearch || "").trim().toLowerCase();
          var conversationByName = {};
          chatInboxRows(state.chatWorkQueue).forEach(function (item) { conversationByName[item.name] = item; });
          var rows = Array.from(shell.querySelectorAll("[data-chat-conversation-name]"));
          var visibleConversations = rows.map(function (row) { return conversationByName[row.getAttribute("data-chat-conversation-name")]; }).filter(Boolean);
          var showCountOnly = countMatchedConversations(visibleConversations, keyword) > 1;
          var visibleCount = 0;
          rows.forEach(function (row) {
            var item = conversationByName[row.getAttribute("data-chat-conversation-name")];
            if (!item) return;
            var name = item.name.toLowerCase();
            var type = row.getAttribute("data-chat-conversation-type") || "";
            var typeMatches = state.chatConversationTab === "全部" || state.chatConversationTab === type;
            var nameMatches = !keyword || name.indexOf(keyword) >= 0;
            var contentMatches = conversationContentMatches(item, keyword);
            var isContentMatch = !!keyword && !nameMatches && contentMatches.length > 0;
            var isCountOnly = isContentMatch && conversationResultCountOnly(item, contentMatches, showCountOnly);
            var isVisible = typeMatches && (nameMatches || isContentMatch);
            row.classList.toggle("is-content-match", isContentMatch);
            row.classList.toggle("is-count-only", isCountOnly);
            var summary = row.querySelector(".ops-conversation-summary");
            if (summary) summary.innerHTML = item.inboxView?chatInboxRowSummary(item):renderConversationSummary(item, keyword, contentMatches, isCountOnly);
            row.hidden = !isVisible;
            if (isVisible) visibleCount += 1;
          });
          var empty = shell.querySelector("[data-chat-conversation-empty]");
          if (empty) empty.hidden = visibleCount > 0;
          if(conversationInbox){
            ['human','ai','all'].forEach(function(queue){var badge=shell.querySelector('[data-inbox-queue-count="'+queue+'"]');if(badge)badge.textContent=chatInboxFiltered(queue,null,true).length;});
            ['全部','私聊','群聊'].forEach(function(kind){var button=shell.querySelector('[data-action="chat-conversation-tab"][data-value="'+kind+'"] .ops-conversation-count');if(button)button.textContent=chatInboxFiltered(state.chatWorkQueue,null,false).filter(function(row){return kind==='全部'||row.type===kind;}).length;});
            shell.querySelectorAll('[data-inbox-project-count]').forEach(function(badge){var count=chatInboxProjectCount(badge.getAttribute('data-inbox-project-count'));badge.textContent=count;badge.hidden=!count;});
            shell.querySelectorAll('[data-inbox-account-count]').forEach(function(badge){var count=chatInboxFiltered('human',badge.getAttribute('data-inbox-account-count'),true).length;badge.textContent=count;badge.hidden=!count;});
          }
        }

        function filterChatMaterials(value) {
          if (!shell) return;
          var keyword = String(value || "").trim().toLowerCase();
          var typeCounts=quickReplyTypeCounts(value);
          shell.querySelectorAll('[data-change-action="chat-material-type"] option').forEach(function(option){
            var label=quickReplyTypeLabel(option.value,typeCounts);if(option.textContent!==label)option.textContent=label;
          });
          var visibleCount = 0;
          shell.querySelectorAll(".ops-material-snippet[data-chat-material-name]").forEach(function (card) {
            var name = (card.getAttribute("data-chat-material-name") || "").toLowerCase();
            var isVisible = !keyword || name.indexOf(keyword) >= 0;
            card.hidden = !isVisible;
            if (isVisible) visibleCount += 1;
          });
          shell.querySelectorAll('.qr-folder').forEach(function(folder){
            var count=Array.from(folder.querySelectorAll('.ops-material-snippet')).filter(function(card){return !card.hidden;}).length;
            folder.hidden=count===0;
            var counter=folder.querySelector('[data-folder-count]');if(counter)counter.textContent='（'+count+'）';
          });
          var empty = shell.querySelector("[data-chat-material-empty]");
          if (empty) empty.hidden = visibleCount > 0;
        }

        function handleClick(event) {
          if (state.chatHistoryCalendarOpen && !event.target.closest(".ops-chat-history-filters")) {
            state.chatHistoryCalendarOpen = false;
            var historyCalendar = shell && shell.querySelector("[data-chat-history-calendar]");
            var historyDateTrigger = shell && shell.querySelector(".ops-chat-history-date-trigger");
            if (historyCalendar) historyCalendar.hidden = true;
            if (historyDateTrigger) historyDateTrigger.setAttribute("aria-expanded", "false");
          }
          if (state.messageMaterialOpen && !event.target.closest("[data-message-material-picker]")) {
            state.messageMaterialOpen = false;
            var materialDropdown = shell && shell.querySelector(".ops-message-material-dropdown");
            var materialTrigger = shell && shell.querySelector(".ops-message-material-trigger");
            if (materialDropdown) materialDropdown.hidden = true;
            if (materialTrigger) materialTrigger.setAttribute("aria-expanded", "false");
          }
          if (state.patientArchiveTagOpen && !event.target.closest("[data-patient-archive-tag-filter]")) {
            state.patientArchiveTagOpen = false;
            var patientTagDropdown = shell && shell.querySelector("[data-patient-archive-tag-options]");
            var patientTagInput = shell && shell.querySelector('[data-bind="patient.tagSearch"]');
            if (patientTagDropdown) patientTagDropdown.hidden = true;
            if (patientTagInput) patientTagInput.setAttribute("aria-expanded", "false");
          }
          var routeTarget = event.target.closest("[data-route]");
          if (routeTarget) {
            event.preventDefault();
            event.stopPropagation();
            var requestedRoute = routeTarget.getAttribute("data-route");
            if (requestedRoute === "aggregate-chat") {
              var chatTabUrl = new URL(window.location.href);
              chatTabUrl.searchParams.set("standalone", "aggregate-chat");
              chatTabUrl.hash = "aggregate-chat";
              var chatTabLink = document.createElement("a");
              chatTabLink.href = chatTabUrl.toString();
              chatTabLink.target = "_blank";
              chatTabLink.rel = "noopener noreferrer";
              chatTabLink.click();
            } else {
              navigate(requestedRoute);
            }
            return;
          }
          var actionTarget = event.target.closest("[data-action],[data-entry-action]");
          if (!actionTarget) return;
          var action = actionTarget.getAttribute("data-action") || actionTarget.getAttribute("data-entry-action");
          if (action === "modal-backdrop" && event.target !== actionTarget) return;
          if (action === 'material-group-editor-backdrop' && event.target !== actionTarget) return;
          if (state.modal && state.modal.type === 'material-groups' && state.modal.groupEditor && ['material-group-editor-cancel','material-group-editor-backdrop','material-group-create'].indexOf(action)<0) return;
          event.preventDefault();

          if (action === "quick-replies-page-close") {
            closeQuickRepliesPage();
          } else if (action === "chat-archive-page-close") {
            closeArchivePage();
          } else if (action === "toggle-menu") {
            var menu = actionTarget.getAttribute("data-menu");
            state.openMenus[menu] = !state.openMenus[menu];
            render();
          } else if (action === "agent-admin") {
            toast("演示：跳转至管理后台的智能体管理");
          } else if (action === "focus-search") {
            var input = shell && shell.querySelector("input:not([type=checkbox]):not([type=radio])");
            if (input) input.focus();
            else toast("当前页面没有可用的搜索项");
          } else if (action === "settings") {
            toast("列表设置已打开");
          } else if (action === "collapse-note") {
            toast("窗口变窄时菜单会自动收起");
          } else if (action === "chat-query-reset") {
            resetChatQuery();
          } else if (action === "chat-query-search") {
            runChatQuery();
          } else if (action === "material-tab") {
            state.materialTab = actionTarget.getAttribute("data-value");
            state.materialType = "全部";
            state.materialGroup = "全部素材";
            state.materialSearch = "";
            state.materialApplied = "";
            render();
          } else if (action === "material-group") {
            state.materialGroup = actionTarget.getAttribute("data-value") || "全部素材";
            state.materialType = "全部";
            render({preserveMaterialScroll:true});
          } else if (action === "material-type") {
            state.materialType = actionTarget.getAttribute("data-value");
            render({preserveMaterialScroll:true});
          } else if (action === "material-search") {
            state.materialApplied = state.materialSearch.trim();
            render();
          } else if (action === "material-reset") {
            state.materialSearch = "";
            state.materialApplied = "";
            state.materialType = "全部";
            state.materialGroup = "全部素材";
            render();
          } else if (action === "material-new") {
            resetMaterialDraft();
            navigate("material-create");
          } else if (action === "chat-material-edit") {
            if(state.chatMaterialScope!=="个人素材" || !state.modal || state.modal.type!=="chat-material-preview")return;
            var previewParent=state.modal,editSource=(materials["个人素材"]||[]).find(function(item){return item.id===previewParent.materialId;});
            if(!editSource)return;
            resetMaterialDraft();state.materialMode="edit";state.selectedMaterial=editSource;
            var draft=Object.assign({},editSource,{title:editSource.name,group:editSource.group==='未分组'?'':editSource.group,scope:"个人素材",type:editSource.type==='音频'?'语音':editSource.type,purposes:["会话","消息推送"].filter(function(purpose){return editSource.purpose.indexOf(purpose==='会话'?'会话':'推送')>=0;})});
            draft.text=editSource.type==='文本'?(editSource.content||editSource.summary||''):'';
            draft.webUrl=editSource.type==='网页'?(editSource.content||''):'';draft.webTitle=editSource.webTitle||editSource.name;draft.webDescription=editSource.webDescription||editSource.summary||'';
            draft.miniTitle=editSource.miniTitle||editSource.name;draft.path=editSource.path||(editSource.type==='小程序'?editSource.content:'');draft.miniDescription=editSource.miniDescription||editSource.summary||'';
            if(['图片','视频','语音','音频','文件'].indexOf(editSource.type)>=0){draft.uploadName=editSource.uploadName||editSource.content||'';draft.uploadUrl=editSource.uploadUrl||editSource.mediaUrl||editSource.thumbnail||'';}
            state.materialDraft=draft;openModal({type:"chat-material-create",editId:editSource.id,parent:previewParent},actionTarget);
          } else if (action === "chat-material-new") {
            if(state.chatMaterialScope !== "个人素材") return;
            resetMaterialDraft();openModal({type:"chat-material-create"},actionTarget);
          } else if (action === "material-form-type") {
            var nextType=actionTarget.getAttribute("data-value");
            if(nextType!==state.materialDraft.type){state.materialDraft.uploadName="";state.materialDraft.uploadUrl="";state.materialDraft.uploadSize=0;}
            state.materialDraft.type = nextType;
            render();
          } else if (action === "material-param-toggle") {
            var parameterMenu = shell && shell.querySelector("#ops-material-parameter-menu");
            var parameterTrigger = actionTarget;
            if (parameterMenu) {
              var parameterOpen = parameterMenu.hidden;
              closeMaterialHelpPopovers();
              if (parameterOpen) {
                bindMaterialHelpDismiss();
                positionMaterialFloating(parameterTrigger, parameterMenu, false);
                parameterTrigger.setAttribute("aria-expanded", "true");
                parameterTrigger.classList.add("is-open");
              }
            }
          } else if (action === "material-param-close") {
            closeMaterialHelpPopovers();
            var parameterReturn = shell && shell.querySelector('[data-action="material-param-toggle"]');
            if (parameterReturn) parameterReturn.focus();
          } else if (action === "material-help-toggle") {
            var helpPopover = actionTarget.parentElement && actionTarget.parentElement.querySelector(".ops-material-help-popover");
            if (helpPopover) {
              var helpOpen = helpPopover.hidden;
              closeMaterialHelpPopovers();
              if (helpOpen) {
                bindMaterialHelpDismiss();
                positionMaterialHelpPopover(actionTarget, helpPopover);
                actionTarget.setAttribute("aria-expanded", "true");
              }
            }
          } else if (action === "material-param-insert") {
            var parameterToken = actionTarget.getAttribute("data-value") || "";
            var richEditor = shell && shell.querySelector('[data-material-rich-text]');
            if (!parameterToken || !richEditor) return;
            var currentText = materialRichTextValue(richEditor), selection = window.getSelection(), range = selection && selection.rangeCount ? selection.getRangeAt(0) : null;
            var nextText = currentText + parameterToken;
            if (range && richEditor.contains(range.commonAncestorContainer)) {
              var beforeRange = document.createRange(); beforeRange.selectNodeContents(richEditor); beforeRange.setEnd(range.startContainer, range.startOffset);
              var afterRange = document.createRange(); afterRange.selectNodeContents(richEditor); afterRange.setStart(range.endContainer, range.endOffset);
              nextText = materialRichTextValueFromRange(beforeRange) + parameterToken + materialRichTextValueFromRange(afterRange);
            }
            if (nextText.length > 200) {
              toast("素材内容不能超过 200 字");
              richEditor.focus();
              return;
            }
            richEditor.innerHTML = materialRichTextMarkup(nextText);
            state.materialDraft.text = nextText;
            var hiddenTextInput = shell && shell.querySelector('[data-bind="material.text"]');
            if (hiddenTextInput) hiddenTextInput.value = nextText;
            var textCounter = document.getElementById("ops-material-count-text");
            if (textCounter) textCounter.textContent = nextText.length + "/200";
            richEditor.focus();
            var lastToken = richEditor.querySelector('[data-material-token]:last-of-type');
            if (lastToken) {
              var caretRange = document.createRange(); caretRange.selectNodeContents(lastToken); caretRange.collapse(false);
              selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(caretRange);
            }
            var openParameterMenu = shell && shell.querySelector("#ops-material-parameter-menu");
            var openParameterTrigger = shell && shell.querySelector('[data-action="material-param-toggle"]');
            if (openParameterMenu) openParameterMenu.hidden = true;
            if (openParameterTrigger) { openParameterTrigger.setAttribute("aria-expanded", "false"); openParameterTrigger.classList.remove("is-open"); }
          } else if (action === "material-file-pick") {
            var picker=shell.querySelector('[data-material-file="'+actionTarget.getAttribute('data-slot')+'"]');if(picker)picker.click();
          } else if (action === "material-form-new-group") {
            openMaterialGroupManager(state.materialDraft.scope,state.modal&&state.modal.type==="chat-material-create"?state.modal:null,true,actionTarget);
          } else if (action === "material-save") {
            saveMaterialDraft();
          } else if (action === "material-cancel") {
            navigate("materials");
          } else if (action === "material-edit") {
            var editItem = findMaterialById(actionTarget.getAttribute("data-id"));
            if (!editItem) return;
            state.selectedMaterial = editItem;
            state.materialMode = "edit";
            state.materialDraft = { title: editItem.name, group: editItem.group, scope: state.materialTab, purposes: editItem.purpose.indexOf("推送") >= 0 ? ["会话", "消息推送"] : ["会话"], type: editItem.type, text: editItem.content || editItem.summary, webTitle: editItem.name, webUrl: editItem.type === "网页" ? editItem.content : "", webDescription: editItem.summary, miniTitle: editItem.name, appId: "wx24a21e88ab2f", path: "pages/health/index", uploadName: editItem.type === "图片" ? editItem.name + ".jpg" : "" };
            state.materialDraft.purposes = ["会话","消息推送"].filter(function(purpose){return purpose==="会话"?editItem.purpose.indexOf("会话")>=0:editItem.purpose.indexOf("推送")>=0;});
            ['webTitle','webDescription','webCoverUrl','miniTitle','appId','path','miniIconUrl','miniImageUrl','uploadName','uploadUrl','uploadSize'].forEach(function(key){if(typeof editItem[key]!=="undefined")state.materialDraft[key]=editItem[key];});
            state.materialDraft.miniImageName = editItem.miniImageName || "";
            state.materialDraft.webCoverName = editItem.webCoverName || "";
            ["miniIconName", "originalId", "miniDescription"].forEach(function (key) {
              state.materialDraft[key] = editItem[key] || "";
            });
            navigate("material-create");
          } else if (action === "material-detail") {
            state.selectedMaterial = findMaterialById(actionTarget.getAttribute("data-id"));
            navigate("material-detail");
          } else if (action === "material-generate-edit") {
            toast("已打开素材修改草稿，需重新审核后发布");
          } else if (action === "material-generate-preview") {
            toast("已生成患者端预览");
          } else if (action === "material-generate-publish") {
            toast("素材已发布到患者端（仅展示合规入口）");
          } else if (action === "care-entry") {
            navigate("care-entry");
          } else if (action === "care-entry-open") {
            toast("已打开已审核机构入口（演示跳转）");
          } else if (action === "care-entry-human") {
            toast("已创建人工接管任务，自动回复暂停");
          } else if (action === "followup-rule-new") {
            toast("已打开随访规则草稿：触发条件 → 自动任务 → 患者发送");
          } else if (action === "followup-rule-preview") {
            var followupRule = followupRules[(Number(actionTarget.getAttribute("data-id")) || 1) - 1] || followupRules[0];
            openModal({ type: "followup-rule-preview", rule: followupRule }, actionTarget);
          } else if (action === "material-pin") {
            var pinItem = findMaterialById(actionTarget.getAttribute("data-id"));
            if (pinItem) pinItem.pinned = !pinItem.pinned;
            toast(pinItem && pinItem.pinned ? "已置顶素材" : "已取消置顶");
          } else if (action === "material-delete") {
            openModal({ type: "confirm", title: "删除素材", message: "确定删除该素材吗？", danger: true, confirmAction: "material-delete", id: actionTarget.getAttribute("data-id"), success: "素材已删除" }, actionTarget);
          } else if (action === "group-settings") {
            openMaterialGroupManager(state.materialTab,null,false,actionTarget);
          } else if (action === "material-group-new") {
            openMaterialGroupEditor();
          } else if (action === "material-group-editor-cancel" || action === "material-group-editor-backdrop") {
            cancelMaterialGroupEditor();
          } else if (action === "material-group-create") {
            createMaterialGroup();
          } else if (action === "material-group-delete") {
            deleteMaterialGroup(Number(actionTarget.getAttribute("data-index")));
          } else if (action === "material-group-finish") {
            finishMaterialGroupManager();
          } else if (action === "label-tab") {
            state.labelTab = actionTarget.getAttribute("data-value");
            state.labelSearch = "";
            state.labelApplied = "";
            render();
          } else if (action === "label-toggle") {
            var label = actionTarget.getAttribute("data-value");
            state.labelCollapsed[label] = !state.labelCollapsed[label];
            render();
          } else if (action === "label-search") {
            state.labelApplied = state.labelSearch.trim();
            render();
          } else if (action === "label-reset") {
            state.labelSearch = "";
            state.labelApplied = "";
            render();
          } else if (action === "label-add-level1") {
            openModal({ type: "label-level1" }, actionTarget);
          } else if (action === "label-add-level2") {
            openModal({ type: "label-level2", parent: actionTarget.getAttribute("data-name") }, actionTarget);
          } else if (action === "label-add-name") {
            openModal({ type: "label-name", parent: actionTarget.getAttribute("data-name") }, actionTarget);
          } else if (action === "label-edit") {
            openModal({ type: "label-edit", name: actionTarget.getAttribute("data-name") }, actionTarget);
          } else if (action === "label-delete") {
            openModal({ type: "confirm", title: "删除标签", message: "删除后，该标签及其下级内容将不再展示。", danger: true, confirmAction: "label-delete", name: actionTarget.getAttribute("data-name"), success: "标签已删除" }, actionTarget);
          } else if (action === "message-status") {
            state.messageStatus = actionTarget.getAttribute("data-value");
            state.moreMenu = false;
            render();
          } else if (action === "message-more") {
            var moreId = actionTarget.getAttribute("data-id");
            state.moreMenu = state.moreMenu === moreId ? false : moreId;
            render();
            if (state.moreMenu) positionMessageMoreMenu(moreId);
          } else if (action === "message-new") {
            state.messageDraft = { taskName: "", sendType: "立即发送", sendAt: "", diagnosis: "", doctor: "", ageMin: "", ageMax: "", gender: "不限（全选）", phone: "", name: "", contentSource: "不引用素材", content: "" };
            state.messageRecipientSearched = false;
            state.messageMaterialOpen = false;
            state.selectedRecipients = [];
            navigate("message-task-create");
          } else if (action === "message-view") {
            openModal({ type: "message-detail", id: actionTarget.getAttribute("data-id") }, actionTarget);
          } else if (action === "message-detail-retry") {
            state.modal = null;
            toast("已重新发送失败消息");
          } else if (action === "message-retry") {
            state.moreMenu = false;
            toast("已重新发送失败消息");
          } else if (action === "message-copy") {
            state.moreMenu = false;
            state.messageRecipientSearched = false;
            state.selectedRecipients = [];
            navigate("message-task-create");
          } else if (action === "message-cancel") {
            var wrap = actionTarget.closest("tr");
            var moreButton = wrap && wrap.querySelector("[data-action=message-more]");
            openModal({ type: "confirm", title: "取消任务", message: "确定取消该消息任务吗？", danger: true, confirmAction: "message-cancel", id: actionTarget.getAttribute("data-id") || (moreButton ? moreButton.getAttribute("data-id") : ""), success: "消息任务已取消" }, actionTarget);
          } else if (action === "message-reset") {
            state.messageFilterDraft = { taskName: "", creator: "", sendType: "全部", createdStart: "", createdEnd: "", sentStart: "", sentEnd: "" };
            state.messageFilterApplied = { taskName: "", creator: "", sendType: "全部", createdStart: "", createdEnd: "", sentStart: "", sentEnd: "" };
            render();
            toast("查询条件已重置");
          } else if (action === "message-search") {
            state.messageFilterApplied = Object.assign({}, state.messageFilterDraft);
            state.moreMenu = false;
            render();
            toast("查询完成");
          } else if (action === "message-disease") {
            openModal({ type: "disease" }, actionTarget);
          } else if (action === "message-material-toggle") {
            state.messageMaterialOpen = !state.messageMaterialOpen;
            render();
          } else if (action === "message-material-select") {
            state.messageDraft.contentSource = actionTarget.getAttribute("data-value") || "不引用素材";
            state.messageMaterialOpen = false;
            render();
          } else if (action === "patient-disease") {
            openModal({ type: "patient-disease" }, actionTarget);
          } else if (action === "patient-tag-open") {
            state.patientArchiveTagOpen = true;
            refreshPatientArchiveTagSelector();
          } else if (action === "patient-tag-select") {
            selectPatientArchiveTag(actionTarget.getAttribute("data-tag"));
          } else if (action === "patient-tag-remove") {
            var archiveTagToRemove = actionTarget.getAttribute("data-tag");
            state.patientArchiveDraft.tags = state.patientArchiveDraft.tags.filter(function (tag) { return tag !== archiveTagToRemove; });
            state.patientArchiveTagOpen = true;
            refreshPatientArchiveTagSelector();
          } else if (action === "patient-search") {
            state.patientArchiveApplied = Object.assign({}, state.patientArchiveDraft, { tags: state.patientArchiveDraft.tags.slice() });
            state.patientArchiveTagOpen = false;
            render();
            toast("查询完成");
          } else if (action === "patient-reset") {
            state.patientArchiveDraft = { name: "", phone: "", project: "", scene: "", doctor: "", tags: [], diagnosis: "" };
            state.patientArchiveApplied = { name: "", phone: "", project: "", scene: "", doctor: "", tags: [], diagnosis: "" };
            state.patientArchiveTagSearch = "";
            state.patientArchiveTagOpen = false;
            render();
            toast("查询条件已重置");
          } else if (action === "patient-detail") {
            state.patientDetailId = actionTarget.getAttribute("data-id") || "pa-1";
            state.patientDetailTab = "病例时间轴";
            state.patientTimelineDetail = null;
            state.patientDetailPhoneVisible = false;
            navigate("patient-archive-detail");
          } else if (action === "patient-back") {
            state.patientTimelineDetail = null;
            state.patientDetailPhoneVisible = false;
            navigate("patient-archives");
          } else if (action === "patient-phone-toggle") {
            state.patientDetailPhoneVisible = !state.patientDetailPhoneVisible;
            render();
          } else if (action === "health-select") {
            var metricKey=actionTarget.getAttribute('data-health-key');
            var healthView=window.PatientHealth.view(metricKey);
            healthView.metric=actionTarget.getAttribute('data-metric');healthView.point='';healthView.expanded=false;
            render({preserveArchiveScroll:true});
          } else if (action === "health-nav-toggle") {
            var navView=window.PatientHealth.view(actionTarget.getAttribute('data-health-key'));
            navView.expanded=!navView.expanded;
            render({preserveArchiveScroll:true});
          } else if (action === "health-filter") {
            window.PatientHealth.view(actionTarget.getAttribute('data-health-key')).filter=actionTarget.getAttribute('data-value');
            render({preserveArchiveScroll:true});
          } else if (action === "health-point") {
            // Keep the chart, modal, focus and scroll in place when inspecting a point.
            var pointKey=actionTarget.getAttribute('data-health-key'),point=actionTarget.getAttribute('data-metric')+'|'+actionTarget.getAttribute('data-date');
            var wasSelected=actionTarget.classList.contains('is-selected');
            shell.querySelectorAll('.hm-point.is-selected').forEach(function(p){p.classList.remove('is-selected');});
            actionTarget.classList.toggle('is-selected',!wasSelected);
            window.PatientHealth.view(pointKey).point=wasSelected?'':point;
          } else if (action === "toggle-metric" || action === "toggle-glucose-type" || action === "toggle-lipid-field") {
            if (!state.modal || state.modal.type !== "health-add") return;
            syncHealthEntryModal();
            var entryValue=action === "toggle-metric" ? actionTarget.getAttribute("data-entry-metric") : action === "toggle-glucose-type" ? actionTarget.getAttribute("data-glucose-type") : actionTarget.getAttribute("data-lipid-field");
            var entryList=action === "toggle-metric" ? state.modal.selected : action === "toggle-glucose-type" ? state.modal.glucoseTypes : state.modal.lipidFields;
            var entryIndex=entryList.indexOf(entryValue);
            if (entryIndex >= 0) entryList.splice(entryIndex,1); else entryList.push(entryValue);
            render({preserveArchiveScroll:true});
            updateHealthEntryModalProgress();
          } else if (action === "health-add" || action === "health-chart") {
            var metric=actionTarget.getAttribute('data-metric'),healthModalState={type:action,key:actionTarget.getAttribute('data-health-key'),metric:metric,period:actionTarget.getAttribute('data-period')||''};
            if(action==='health-add') {healthModalState.selected=[metric];healthModalState.glucoseTypes=[];healthModalState.lipidFields=[];healthModalState.values=Object.create(null);healthModalState.date=todayLocalIso();}
            openModal(healthModalState,actionTarget);
            if(action==='health-add') {
              var dateInput=shell.querySelector('[data-entry-date]');if(dateInput)dateInput.max=todayLocalIso();
              updateHealthEntryModalProgress();
            }
          } else if (action === "patient-detail-tab") {
            state.patientDetailTab = actionTarget.getAttribute("data-value") || "病例时间轴";
            state.patientTimelineDetail = null;
            render({preserveArchiveScroll:true,archiveTabChanged:true});
          } else if (action === "patient-timeline-detail") {
            state.patientTimelineDetail = Number(actionTarget.getAttribute("data-event-index"));
            state.patientDetailTab = "病例时间轴";
            render({focusArchiveDetail:true});
          } else if (action === "patient-timeline-back") {
            state.patientTimelineDetail = null;
            render();
          } else if (action === "patient-tags-edit") {
            var archivePatient = patientArchives.filter(function (patient) { return patient.id === state.patientDetailId; })[0] || patientArchives[0];
            openModal({ type: "patient-archive-tags", id: archivePatient.id, tags: archivePatient.tags.slice(), patientTagSearch: "" }, actionTarget);
          } else if (action === "ops-patient-search") {
            state.opsPatientApplied = Object.assign({}, state.opsPatientDraft);
            render();
            toast("查询完成");
          } else if (action === "ops-patient-reset") {
            state.opsPatientDraft = { name: "", phone: "", diagnosis: "", doctor: "", hospital: "", archived: "", medical: "", project: "", scene: "", registeredStart: "", registeredEnd: "" };
            state.opsPatientApplied = { name: "", phone: "", diagnosis: "", doctor: "", hospital: "", archived: "", medical: "", project: "", scene: "", registeredStart: "", registeredEnd: "" };
            render();
            toast("查询条件已重置");
          } else if (action === "ops-patient-view") {
            openModal({ type: "ops-patient-detail", id: actionTarget.getAttribute("data-id") }, actionTarget);
          } else if (action === "ops-patient-export") {
            toast("患者列表已导出");
          } else if (action === "ops-phone-view") {
            toast("已验证权限并展示患者联系电话");
          } else if (action === "ops-scene-view") {
            toast("渠道码预览已打开");
          } else if (action === "recipient-all") {
            state.selectedRecipients = recipients.map(function (item) { return item.id; });
            render();
          } else if (action === "recipient-current") {
            state.selectedRecipients = recipients.map(function (item) { return item.id; });
            render();
          } else if (action === "recipient-none") {
            state.selectedRecipients = [];
            render();
          } else if (action === "recipient-reset") {
            state.messageDraft.diagnosis = "";
            state.messageDraft.doctor = "";
            state.messageDraft.ageMin = "";
            state.messageDraft.ageMax = "";
            state.messageDraft.gender = "不限（全选）";
            state.messageDraft.phone = "";
            state.messageDraft.name = "";
            state.messageRecipientSearched = false;
            state.messageMaterialOpen = false;
            state.selectedRecipients = [];
            render();
          } else if (action === "recipient-search") {
            var audienceDraft = state.messageDraft;
            var hasAudienceFilter = [audienceDraft.diagnosis, audienceDraft.doctor, audienceDraft.ageMin, audienceDraft.ageMax, audienceDraft.phone, audienceDraft.name].some(function (value) {
              return String(value || "").trim();
            }) || audienceDraft.gender !== "不限（全选）";
            if (!hasAudienceFilter) {
              state.messageRecipientSearched = false;
              state.selectedRecipients = [];
              state.messageMaterialOpen = false;
              render();
              toast("请至少填写一个圈选对象查询条件");
              return;
            }
            state.messageRecipientSearched = true;
            state.selectedRecipients = recipients.map(function (item) { return item.id; });
            render();
            toast("已根据条件更新发送对象");
          } else if (action === "message-create-cancel") {
            state.messageMaterialOpen = false;
            navigate("message-tasks");
          } else if (action === "message-send") {
            if (!state.messageDraft.taskName.trim() || !state.messageDraft.content.trim() || !state.selectedRecipients.length) {
              toast("请填写任务名称、消息内容并选择发送对象");
              return;
            }
            if (state.messageDraft.sendType === "定时发送" && !state.messageDraft.sendAt) {
              toast("请选择发送时间");
              return;
            }
            messageTasks.unshift({ id: "msg-" + Date.now(), name: state.messageDraft.taskName, content: state.messageDraft.content, audience: state.messageDraft.diagnosis ? "诊断：" + state.messageDraft.diagnosis : "已选择患者", target: state.selectedRecipients.length, success: null, failed: null, sendType: state.messageDraft.sendType === "立即发送" ? "立即" : "定时", status: state.messageDraft.sendType === "立即发送" ? "进行中" : "待执行", sentAt: state.messageDraft.sendType === "立即发送" ? "刚刚" : state.messageDraft.sendAt.replace("T", " "), createdAt: "刚刚", creator: "管理员" });
            state.messageStatus = state.messageDraft.sendType === "立即发送" ? "进行中" : "待执行";
            navigate("message-tasks");
            window.setTimeout(function () { toast("消息任务已创建"); }, 10);
          } else if (action === "chat-doctor") {
            state.chatReadOnlyContext=null;
            state.chatDoctorSelected = actionTarget.getAttribute("data-chat-doctor-name");state.chatConversationSelectedKey=null;state.chatSubjectSelected=null;
            state.chatArchiveTab = "病例时间轴";
            state.chatArchiveMetric = 0;
            state.chatArchiveTimelineDetail = null;
            state.chatAiAutoStartedKey = "";
            state.modal = null;
            render();
          } else if (action === "chat-archive-tab") {
            var archiveTab = actionTarget.getAttribute("data-value");
            var selectedArchivePanel = actionTarget.closest('[data-archive-id]');
            if (!selectedArchivePanel || !Array.from(selectedArchivePanel.querySelectorAll('.cp-tabs [data-value]')).some(function(tabButton){return tabButton.getAttribute('data-value')===archiveTab;})) return;
            state.chatArchiveTab = archiveTab;
            state.chatArchiveTabsExpanded = false;
            state.chatArchiveTimelineDetail = null;
            state.chatArchiveEditMode = null;
            state.chatArchiveFileOriginal = null;
            render({preserveArchiveScroll:true,archiveTabChanged:true,focusArchiveDetail:true});
          } else if (action === "chat-archive-timeline-detail") {
            state.chatArchiveTimelineDetail = Number(actionTarget.getAttribute("data-event-index"));
            state.chatArchiveTab = "病例时间轴";
            state.chatArchiveEditMode = null;
            state.chatArchiveFileOriginal = null;
            render({preserveArchiveScroll:true,focusArchiveDetail:true});
          } else if (action === "chat-archive-timeline-back") {
            state.chatArchiveTimelineDetail = null;
            state.chatArchiveEditMode = null;
            state.chatArchiveFileOriginal = null;
            render({preserveArchiveScroll:true});
          } else if (action === "chat-archive-file-original") {
            state.chatArchiveFileOriginal = { eventIndex:Number(actionTarget.getAttribute("data-event-index")), fileIndex:Number(actionTarget.getAttribute("data-file-index")) };
            state.chatArchiveTab = "病例时间轴";
            render({preserveArchiveScroll:true,focusArchiveDetail:true});
          } else if (action === "chat-archive-file-original-back") {
            state.chatArchiveFileOriginal = null;
            render({preserveArchiveScroll:true,focusArchiveDetail:true});
          } else if (action === "chat-archive-edit") {
            state.chatArchiveEditMode = Number(actionTarget.getAttribute("data-event-index"));
            state.chatArchiveTimelineDetail = state.chatArchiveEditMode;
            state.chatArchiveFileOriginal = null;
            render({preserveArchiveScroll:true,focusArchiveDetail:true});
          } else if (action === "chat-archive-edit-cancel") {
            state.chatArchiveEditMode = null;
            render({preserveArchiveScroll:true,focusArchiveDetail:true});
          } else if (action === "chat-archive-edit-save") {
            event.preventDefault();
            var editForm = actionTarget.closest("form");
            var editConversation = selectedChatConversation();
            var editContext = window.ChatPatientArchive.context(editConversation, state.chatDoctorSelected, state.chatArchiveScene);
            var editEventIndex = Number(actionTarget.getAttribute("data-event-index"));
            if (editForm && window.ChatPatientArchive.updateTimelineEvent) {
              var dateField = editForm.querySelector('[name="visitDate"]');
              var contentField = editForm.querySelector('[name="visitContent"]');
              window.ChatPatientArchive.updateTimelineEvent(editContext, editEventIndex, { date:dateField ? dateField.value : "", text:contentField ? contentField.value.trim() : "" });
            }
            state.chatArchiveEditMode = null;
            render({preserveArchiveScroll:true,focusArchiveDetail:true});
          } else if (action === "chat-archive-resummarize" || action === "chat-archive-reread") {
            var archiveConversationForAction = selectedChatConversation();
            var archiveActionContext = window.ChatPatientArchive.context(archiveConversationForAction, state.chatDoctorSelected, state.chatArchiveScene);
            var archiveActionIndex = Number(actionTarget.getAttribute("data-event-index"));
            var archiveActionEvent = window.ChatPatientArchive.findTimelineEvent(archiveActionContext, archiveActionIndex);
            if (!archiveActionEvent) return;
            var isResummary = action === "chat-archive-resummarize";
            var previousStatus = archiveActionEvent.status || "已完成";
            var previousTone = archiveActionEvent.statusTone || "success";
            state.chatArchiveTimelineDetail = archiveActionIndex;
            state.chatArchiveTab = "病例时间轴";
            state.chatArchiveEditMode = null;
            state.chatArchiveFileOriginal = null;
            window.ChatPatientArchive.updateTimelineEvent(archiveActionContext, archiveActionIndex, isResummary ? {status:"总结中",statusTone:"loading",readingStatus:"processing",report:""} : {status:previousStatus,statusTone:previousTone,readingStatus:"processing",report:""});
            render({preserveArchiveScroll:true});
            var archiveActionPatient = state.chatSelected;
            window.setTimeout(function () {
              if (state.chatSelected !== archiveActionPatient) return;
              var finishConversation = selectedChatConversation();
              var finishContext = window.ChatPatientArchive.context(finishConversation, state.chatDoctorSelected, state.chatArchiveScene);
              var finishedEvent = window.ChatPatientArchive.findTimelineEvent(finishContext, archiveActionIndex);
              window.ChatPatientArchive.updateTimelineEvent(finishContext, archiveActionIndex, isResummary ? {date:finishedEvent && (finishedEvent.successDate || finishedEvent.date) || "2026-10-21",type:finishedEvent && (finishedEvent.successType || finishedEvent.type) || "病历总结",text:finishedEvent && finishedEvent.successText || "复查报告示例已完成总结，原始文件已关联。",status:"已完成",statusTone:"success",readingStatus:"completed",hasReport:true,report:"报告解读已完成，内容按原始病历记录整理展示。（示例解读）"} : {status:"已完成",statusTone:"success",readingStatus:"completed",hasReport:true,report:"报告解读已完成，内容按原始病历记录整理展示。（示例解读）"});
              render({preserveArchiveScroll:true});
            },1200);
          } else if (action === "chat-ai-summary-generate") {
            generateChatAiSummary();
          } else if (action === "chat-ai-summary-jump") {
            var jumpType = actionTarget.getAttribute("data-target-type") || "archive";
            var jumpTab = actionTarget.getAttribute("data-target-tab") || "病例时间轴";
            if (jumpType === "chat") {
              state.chatHistoryOpen = true;
              state.chatHistoryTab = "全部";
              render({ preserveArchiveScroll: true });
              window.setTimeout(function () { toast("已打开近期聊天记录，请核对原始上下文"); }, 10);
            } else {
              state.chatArchiveTab = jumpTab;
              state.chatArchiveTimelineDetail = null;
              state.chatArchiveTabsExpanded = false;
              render({ preserveArchiveScroll: true, archiveTabChanged: true });
            }
          } else if (action === "chat-archive-tabs-toggle") {
            state.chatArchiveTabsExpanded = !state.chatArchiveTabsExpanded;
            render({preserveArchiveScroll:true});
          } else if (action === "chat-patient-phone-toggle") {
            state.chatPatientPhoneVisible = !state.chatPatientPhoneVisible;
            render();
          } else if (action === "chat-archive-scene-toggle") {
            var sceneSelect = actionTarget.closest(".cp-scene-select");
            if (sceneSelect) {
              var sceneOpen = !sceneSelect.classList.contains("is-open");
              sceneSelect.classList.toggle("is-open", sceneOpen);
              var sceneTrigger = sceneSelect.querySelector(".cp-scene-trigger");
              if (sceneTrigger) sceneTrigger.setAttribute("aria-expanded", String(sceneOpen));
            }
          } else if (action === "chat-archive-scene") {
            state.chatArchiveScene = actionTarget.getAttribute("data-value") || "慢病随访";
            state.chatArchiveTab = "病例时间轴";
            state.chatArchiveMetric = 0;
            state.chatArchiveTimelineDetail = null;
            state.chatAiAutoStartedKey = "";
            render();
          } else if (action === "chat-archive-metric") {
            state.chatArchiveMetric = Number(actionTarget.getAttribute("data-index")) || 0;
            render({preserveArchiveScroll:true});
          } else if (action === "chat-archive-expand") {
            openModal({ type: "chat-archive" }, actionTarget);
          } else if (action === "chat-project-toggle") {
            var chatProject = actionTarget.getAttribute("data-project");
            state.chatCollapsedProjects[chatProject] = !state.chatCollapsedProjects[chatProject];
            render();
          } else if (action === "chat-doctor-panel-toggle") {
            state.chatDoctorPanelCollapsed = !state.chatDoctorPanelCollapsed;
            render();
          } else if (action === "chat-workbench-panel-toggle") {
            state.chatWorkbenchCollapsed = !state.chatWorkbenchCollapsed;
            render();
          } else if (action === "chat-history-toggle") {
            state.chatHistoryOpen = !state.chatHistoryOpen;
            state.chatHistoryCalendarOpen = false;
            state.chatWorkbenchCollapsed = false;
            render();
          } else if (action === "chat-history-tab") {
            state.chatHistoryTab = actionTarget.getAttribute("data-value") || "全部";
            render();
          } else if (action === "chat-history-date-toggle") {
            state.chatHistoryCalendarOpen = !state.chatHistoryCalendarOpen;
            if (state.chatHistoryCalendarOpen) {
              var historyDates = chatHistoryAvailableDates();
              state.chatHistoryCalendarMonth = state.chatHistoryDate === "全部" ? historyDates[historyDates.length - 1].slice(0, 7) : state.chatHistoryDate.slice(0, 7);
            }
            render();
          } else if (action === "chat-history-month-prev" || action === "chat-history-month-next") {
            var historyMonths = chatHistoryAvailableDates();
            var shiftedMonth = chatHistoryMonthShift(state.chatHistoryCalendarMonth, action === "chat-history-month-prev" ? -1 : 1);
            if (shiftedMonth >= historyMonths[0].slice(0, 7) && shiftedMonth <= historyMonths[historyMonths.length - 1].slice(0, 7)) {
              state.chatHistoryCalendarMonth = shiftedMonth;
              render();
            }
          } else if (action === "chat-history-date-select") {
            var selectedHistoryDate = actionTarget.getAttribute("data-value");
            if (chatHistoryAvailableDates().indexOf(selectedHistoryDate) >= 0) {
              state.chatHistoryDate = selectedHistoryDate;
              state.chatHistoryCalendarOpen = false;
              render();
            }
          } else if (action === "chat-history-date-clear") {
            state.chatHistoryDate = "全部";
            state.chatHistoryCalendarOpen = false;
            render();
          } else if (action === "chat-doctor-filter") {
            state.chatDoctorFilterOpen = !state.chatDoctorFilterOpen;
            render();
            if (state.chatDoctorFilterOpen) {
              window.requestAnimationFrame(function () {
                var doctorSearchInput = document.getElementById("ops-chat-doctor-search");
                if (doctorSearchInput) doctorSearchInput.focus();
              });
            }
          } else if (action === "chat-conversation-tab") {
            state.chatConversationTab = actionTarget.getAttribute("data-value") || "全部";
            render();
          } else if (action === "chat-conversation-search") {
            state.chatConversationSearchOpen = !state.chatConversationSearchOpen;
            render();
            if (state.chatConversationSearchOpen) {
              window.requestAnimationFrame(function () {
                var conversationSearchInput = document.getElementById("ops-chat-conversation-search");
                if (conversationSearchInput) conversationSearchInput.focus();
              });
            }
          } else if (action === "chat-conversation-sort") {
            if(state.chatWorkQueue==='human'){toast('待人工按优先级、超时和等待时长排序');return;}
            state.chatConversationNewestFirst = !state.chatConversationNewestFirst;
            render();
          } else if (action === "chat-conversation-refresh") {
            if(conversationInbox){conversationInbox.store.refresh();conversationInbox.sync();}render();toast('会话列表已刷新');
          } else if (action === "quick-replies-tab-nav") {
            var quickRepliesTabTarget = actionTarget.getAttribute("data-value") || "quick-replies";
            var quickRepliesTabUrl = new URL(window.location.href);
            if (quickRepliesTabTarget === "handoff") {
              quickRepliesTabUrl.searchParams.set("standalone", "aggregate-chat");
              quickRepliesTabUrl.searchParams.set("panel", "handoff");
            } else {
              quickRepliesTabUrl.searchParams.set("standalone", quickRepliesTabTarget);
              quickRepliesTabUrl.searchParams.delete("panel");
            }
            quickRepliesTabUrl.hash = "#aggregate-chat";
            window.location.href = quickRepliesTabUrl.href;
          } else if (action === "chat-workbench-tab") {
            state.chatWorkbenchTab = actionTarget.getAttribute("data-value") || "快捷回复";
            if (state.chatWorkbenchTab !== "AI小结") state.chatAiAutoStartedKey = "";
            if (state.chatWorkbenchTab !== "患者档案") state.chatArchiveTimelineDetail = null;
            state.chatWorkbenchCollapsed = false;
            state.chatHistoryOpen = false;
            render();
          } else if (action === "chat-ai-summary-open") {
            state.chatWorkbenchTab = "AI小结";
            state.chatWorkbenchCollapsed = false;
            state.chatHistoryOpen = false;
            render({ preserveArchiveScroll: true });
          } else if (action === "chat-material-scope") {
            var nextMaterialScope = actionTarget.getAttribute("data-value");
            if(["个人素材","租户素材","平台素材"].indexOf(nextMaterialScope)<0)return;
            state.chatMaterialScope = nextMaterialScope;
            state.chatMaterialGroup = "全部素材";
            state.chatMaterialType = "全部类型";
            render({preserveMaterialScroll:true});
          } else if (action === "chat-material-folder-toggle") {
            var folderKey=actionTarget.getAttribute("data-folder-key");
            state.chatMaterialCollapsed[folderKey]=!state.chatMaterialCollapsed[folderKey];
            render({preserveMaterialScroll:true});
          } else if (action === "chat-material-type") {
            state.chatMaterialType = actionTarget.getAttribute("data-value") || "全部类型";
            render({preserveMaterialScroll:true});
          } else if (action === "chat-material-group") {
            state.chatMaterialGroup = actionTarget.getAttribute("data-value") || "全部素材";
            render({preserveMaterialScroll:true});
          } else if (action === "chat-patient-profile") {
            state.chatWorkbenchTab = "患者档案";
            state.chatArchiveTimelineDetail = null;
            state.chatWorkbenchCollapsed = false;
            state.chatHistoryOpen = false;
            render();
          } else if (action === "chat-patient-tags-edit") {
            var currentPatientTags = state.chatPatientTags[state.chatSelected] || [];
            openModal({ type: "chat-patient-tags", patient: state.chatSelected, tags: currentPatientTags.slice(), patientTagSearch: "", tagScope: "个人标签", tagPage: 1 }, actionTarget);
          } else if (action === "chat-patient-tag-select") {
            selectPatientTag(actionTarget.getAttribute("data-tag"));
          } else if (action === "chat-patient-tag-scope") {
            state.modal.tagScope = actionTarget.getAttribute("data-value") || "个人标签";
            state.modal.tagPage = 1;
            refreshPatientTagModal();
          } else if (action === "chat-patient-tag-page") {
            var pageDirection = actionTarget.getAttribute("data-value");
            state.modal.tagPage = Math.max(1, (state.modal.tagPage || 1) + (pageDirection === "next" ? 1 : -1));
            refreshPatientTagModal();
          } else if (action === "chat-patient-tag-remove") {
            var patientTagToRemove = actionTarget.getAttribute("data-tag");
            state.modal.tags = state.modal.tags.filter(function (tag) { return tag !== patientTagToRemove; });
            refreshPatientTagModal();
          } else if (action === "patient-followups-close") {
            followupNavigationHint="若页面未关闭，请使用企微或浏览器自带的关闭按钮。";render();try{window.close();}catch(error){}
          } else if (action === "chat-followup-create-toggle") {
            if(!syncChatFollowups())return;
            state.chatFollowupFormOpen = !state.chatFollowupFormOpen;
            if (state.chatFollowupFormOpen) state.chatFollowupDate = todayLocalIso();
            render();
          } else if (action === "chat-followup-detail-toggle") {
            var followupIndex = Number(actionTarget.getAttribute("data-index"));
            if (!Number.isInteger(followupIndex) || followupIndex < 0 || followupIndex >= state.chatFollowups.length) return;
            state.chatFollowupExpandedEntry = state.chatFollowupExpandedEntry === followupIndex ? null : followupIndex;
            render();
          } else if (action === "chat-followup-save") {
            if(!syncChatFollowups()){toast("无法确定当前患者和医生");return;}
            if (state.chatFollowupDate && state.chatFollowupDate > todayLocalIso()) {
              toast("跟进日期不能晚于今天");
              return;
            }
            if (state.chatFollowupContent.length > 500) {
              toast("跟进内容不能超过500字");
              return;
            }
            var followupContent = state.chatFollowupContent.trim();
            if (!followupContent) {
              toast("请填写跟进内容");
              return;
            }
            state.chatFollowups.unshift({ date: state.chatFollowupDate || todayLocalIso(), content: followupContent });
            state.chatFollowupContent = "";
            state.chatFollowupFormOpen = false;
            state.chatFollowupExpandedEntry = null;
            render();
            window.setTimeout(function () { toast("跟进记录已保存"); }, 10);

          } else if(action==='inbox-queue'){
            var queue=actionTarget.getAttribute('data-inbox-queue');if(['human','ai','all'].indexOf(queue)<0)return;
            state.chatWorkQueue=queue;state.chatReadOnlyContext=null;state.chatSubjectSelected=null;state.modal=null;render();
          } else if(action==='inbox-select-subject'||action==='inbox-origin'||action==='inbox-complete'||action==='inbox-wait-patient'||action==='inbox-claim'){
            var command=chatInboxCommand(actionTarget),current=chatInboxSelected();if(!command||!current||command.subject.conversationKey!==current.key)return;
            if(action==='inbox-select-subject'){state.chatSubjectSelected=command.subject.id;render({preserveChatScroll:true});return;}
            if(action==='inbox-origin'){
              var origin=Array.from(shell.querySelectorAll('[data-chat-message-id]')).find(function(node){return node.getAttribute('data-chat-message-id')===command.subject.originMessageId;});
              if(origin){origin.scrollIntoView({block:'center',behavior:'smooth'});origin.focus({preventScroll:true});origin.classList.add('is-inbox-origin');window.setTimeout(function(){origin.classList.remove('is-inbox-origin');},1800);}else toast('原消息未留存');return;
            }
            if(chatInboxIsHistory())return;
            var result;
            if(action==='inbox-claim'){
              var request='claim-'+Date.now()+'-'+(++inboxOperationCounter);result=conversationInbox.store.claim(command.subject.id,Object.assign({},command.command,{id:request,requestId:request,attemptId:'attempt-1',name:conversationInbox.actor.name}));
              if(result.ok)result=chatInboxSettle(result,{ok:true});
            }else result=action==='inbox-complete'?conversationInbox.store.complete(command.subject.id,command.command):conversationInbox.store.waitForPatient(command.subject.id,command.command);
            if(!result.ok)toast(result.code==='stale_subject'?'事项已有新消息，请重新查看后操作':'当前无法处理这件事项');
            else{state.chatSubjectSelected=null;state.chatDraft='';render({preserveArchiveScroll:true});}
          } else if (action === "chat-select") {
            state.chatReadOnlyContext=null;
            var selectedPatientName=actionTarget.getAttribute("data-name"),selectedConversationKey=actionTarget.getAttribute("data-chat-conversation-key"),selectedRow=chatVisibleConversations().find(function(item){return selectedConversationKey?item.inboxKey===selectedConversationKey:item.name===selectedPatientName;});
            if(!selectedRow)return;
            var patientChanged = state.chatSelected !== selectedPatientName;
            selectArchivePatient(selectedPatientName,selectedRow.inboxKey);
            state.chatSubjectSelected=null;var opened=chatInboxSelected();if(opened)conversationInbox.store.markRead(opened.key);
            if (patientChanged && window.ClinicAudio) window.ClinicAudio.playNewPatientEntry(selectedPatientName);
            state.chatArchiveTab = "病例时间轴";
            state.chatArchiveMetric = 0;
            state.chatArchiveScene = "慢病随访";
            state.chatAiAutoStartedKey = "";
            state.modal = null;
            state.chatHistoryCalendarOpen = false;
            render();
          } else if (action === "chat-send") {
            sendChatMessage();
          } else if (action === "chat-material") {
            state.chatDraft = actionTarget.getAttribute("data-value") || "";
            render();
            window.requestAnimationFrame(function () { var chatInput = document.getElementById("ops-chat-input"); if (chatInput) chatInput.focus(); });
          } else if (action === "chat-material-pin" || action === "chat-material-delete" || action === "chat-material-delete-confirm") {
            if(state.chatMaterialScope !== "个人素材") return;
            var deleteConfirmation = action === "chat-material-delete-confirm";
            if(deleteConfirmation && (!state.modal || state.modal.type !== "chat-material-delete")) return;
            var personalId = deleteConfirmation ? state.modal.materialId : actionTarget.getAttribute("data-chat-material-id");
            var personalItem = materials["个人素材"].filter(function(item){return item.id===personalId;})[0];
            if(!personalItem)return;
            if(action === "chat-material-pin") {
              personalItem.pinned=!personalItem.pinned;
              personalItem.quickReplyPinOrder=personalItem.pinned ? ++materialSequence : 0;
              if(personalItem.pinned)state.chatMaterialCollapsed[state.chatMaterialScope+"|__pinned__"]=false;
              render({preserveMaterialScroll:true});
            } else if(!deleteConfirmation) {
              openModal({type:"chat-material-delete",materialId:personalItem.id,name:personalItem.name},actionTarget);
            } else {
              materials["个人素材"]=materials["个人素材"].filter(function(item){return item.id!==personalId;});
              state.modal=null;
              render({preserveMaterialScroll:true});
            }
          } else if (action === "chat-material-preview") {
            openModal({ type: "chat-material-preview", materialId: actionTarget.getAttribute("data-chat-material-id"), name: actionTarget.getAttribute("data-chat-material-name") || "素材", typeName: actionTarget.getAttribute("data-chat-material-type") || "文本", content: actionTarget.getAttribute("data-value") || "" }, actionTarget);
          } else if (action === "chat-material-send") {
            state.chatDraft = actionTarget.getAttribute("data-value") || "";
            sendChatMessage();
          } else if (action === "material-preview-video-toggle") {
            var videoPlayer = actionTarget.closest ? actionTarget.closest("[data-video-prototype]") : null;
            if (videoPlayer) {
              var videoPlaying = videoPlayer.classList.toggle("is-playing");
              actionTarget.setAttribute("aria-pressed", videoPlaying ? "true" : "false");
              actionTarget.setAttribute("aria-label", videoPlaying ? "暂停视频" : "播放视频");
              var videoIcon = actionTarget.querySelector(".ops-material-video-play-icon");
              if (videoIcon) videoIcon.textContent = videoPlaying ? "Ⅱ" : "▶";
              var videoState = videoPlayer.querySelector("[data-video-state]");
              var videoProgress = videoPlayer.querySelector(".ops-material-video-progress span");
              if (videoPlayer._prototypeVideoTimer) window.clearInterval(videoPlayer._prototypeVideoTimer);
              if (videoPlaying) {
                var videoElapsed = Number(videoPlayer.getAttribute("data-video-elapsed") || 0);
                var videoDurationText = videoPlayer.getAttribute("data-video-duration") || "03:12";
                var videoDurationParts = videoDurationText.split(":");
                var videoDurationSeconds = Number(videoDurationParts[0]) * 60 + Number(videoDurationParts[1] || 0) || 192;
                videoPlayer._prototypeVideoTimer = window.setInterval(function () {
                  videoElapsed = Math.min(videoDurationSeconds, videoElapsed + 1);
                  videoPlayer.setAttribute("data-video-elapsed", String(videoElapsed));
                  var videoMinutes = String(Math.floor(videoElapsed / 60)).padStart(2, "0");
                  var videoSeconds = String(videoElapsed % 60).padStart(2, "0");
                  if (videoState) videoState.textContent = videoMinutes + ":" + videoSeconds;
                  if (videoProgress) videoProgress.style.width = Math.round(videoElapsed / videoDurationSeconds * 100) + "%";
                  if (videoElapsed >= videoDurationSeconds) {
                    videoPlayer.classList.remove("is-playing");
                    actionTarget.setAttribute("aria-pressed", "false");
                    actionTarget.setAttribute("aria-label", "播放视频");
                    if (videoIcon) videoIcon.textContent = "▶";
                    window.clearInterval(videoPlayer._prototypeVideoTimer);
                    videoPlayer._prototypeVideoTimer = null;
                  }
                }, 1000);
              }
            }
          } else if (action === "material-preview-audio-toggle") {
            var audioPlayer = actionTarget.closest ? actionTarget.closest("[data-audio-prototype]") : null;
            if (audioPlayer) {
              var isPlaying = audioPlayer.classList.toggle("is-playing");
              actionTarget.setAttribute("aria-pressed", isPlaying ? "true" : "false");
              actionTarget.setAttribute("aria-label", isPlaying ? "暂停音频" : "播放音频");
              var audioIcon = actionTarget.querySelector("span");
              if (audioIcon) audioIcon.textContent = isPlaying ? "Ⅱ" : "▶";
              var audioState = audioPlayer.querySelector("[data-audio-state]");
              var audioProgress = audioPlayer.querySelector(".ops-material-audio-progress span");
              if (audioPlayer._prototypeAudioTimer) window.clearInterval(audioPlayer._prototypeAudioTimer);
              if (isPlaying) {
                var elapsed = Number(audioPlayer.getAttribute("data-audio-elapsed") || 0);
                var durationText = audioPlayer.getAttribute("data-audio-duration") || "00:36";
                var durationParts = durationText.split(":");
                var durationSeconds = Number(durationParts[0]) * 60 + Number(durationParts[1] || 0) || 36;
                audioPlayer._prototypeAudioTimer = window.setInterval(function () {
                  elapsed = Math.min(durationSeconds, elapsed + 1);
                  audioPlayer.setAttribute("data-audio-elapsed", String(elapsed));
                  var minutes = String(Math.floor(elapsed / 60)).padStart(2, "0");
                  var seconds = String(elapsed % 60).padStart(2, "0");
                  if (audioState) audioState.textContent = minutes + ":" + seconds;
                  if (audioProgress) audioProgress.style.width = Math.round(elapsed / durationSeconds * 100) + "%";
                  if (elapsed >= durationSeconds) {
                    audioPlayer.classList.remove("is-playing");
                    actionTarget.setAttribute("aria-pressed", "false");
                    actionTarget.setAttribute("aria-label", "播放音频");
                    if (audioIcon) audioIcon.textContent = "▶";
                    window.clearInterval(audioPlayer._prototypeAudioTimer);
                    audioPlayer._prototypeAudioTimer = null;
                  }
                }, 1000);
              }
            }
          } else if (action === "material-preview-send") {
            state.chatDraft = readModalValue("material-content");
            state.modal = null;
            sendChatMessage();
          } else if (action === "chat-transfer") {
            openHandoff("manual",actionTarget);
          } else if (action === "handoff-recipient-type") {
            if (!state.modal || state.modal.type !== "transfer") return;
            state.modal.recipientType = actionTarget.getAttribute("data-value") || "assistant";
            state.modal.toId = "";
            render();
          } else if(action==='inbox-takeover'){
            var current=chatInboxSelected(),s=chatInboxSubject();if(!s||chatInboxIsHistory()||!conversationInbox.store.canOperate(s.id,{action:'takeover'}))return;
            var request='takeover-'+Date.now()+'-'+(++inboxOperationCounter),op=conversationInbox.store.beginOperation({id:request,requestId:request,attemptId:'attempt-1',subjectId:s.id,kind:'takeover',expectedRevision:s.revision,throughPatientSeq:s.lastPatientSeq,to:{id:conversationInbox.actor.id,name:conversationInbox.actor.name,kind:'doctor'}});
            if(!op.ok){toast('当前无法接手，请重新查看事项');return;}
            var actual=current.kind==='group'?{ok:true}:window.PatientHandoffs.takeOver(getHandoffContext()),result=chatInboxSettle(op,actual);
            if(actual.ok&&result&&result.applied){render({preserveArchiveScroll:true});toast('已接手当前事项');}else toast('接手未完成，请重试');
          } else if (action === "chat-takeover") {
            if(conversationInbox&&!chatInboxCanOperate()){render();return;}
            if(state.chatReadOnlyContext===chatOutboxScope(getHandoffContext())){render();return;}
            var takeoverResult=window.PatientHandoffs.takeOver(getHandoffContext());
            if(takeoverResult.ok){render({preserveArchiveScroll:true});toast("人工已接手，AI 自动回复已暂停");}
            else toast(takeoverResult.message||"接手失败，请重试");
          } else if (action === "chat-transfer-ai") {
            var returningContext=getHandoffContext(),returningRequest='return-view-'+Date.now()+'-'+(++handoffRequestSequence);
            if(conversationInbox&&!chatInboxCanOperate()){render();return;}
            var returningSubject=conversationInbox&&chatInboxSubject(),returningOp=returningSubject&&chatInboxBeginTransfer({kind:'ai',id:'ai-demo',name:'AI'},returningSubject,returningRequest);
            if(returningOp&&!returningOp.ok){toast('当前无法转交，请重新查看事项');return;}
            window.PatientHandoffs.returnToAi(returningContext).then(function(result){var applied=chatInboxSettle(returningOp,result);if(result.ok&&(!applied||applied.applied)){state.chatSubjectSelected=null;recordChatDispatch(returningContext,returningRequest);render({preserveArchiveScroll:true});}toast(result.ok?"已转交 AI":result.code==="superseded_by_reply"?"医生已接手，本次转交已取消":"AI 回接失败，请重试");});
          } else if (action === "chat-unread") {
            var unreadConversation=chatInboxSelected();if(unreadConversation)conversationInbox.store.markUnread(unreadConversation.key);render();toast('已标记为未读');
          } else if (action === "member-add") {
            openModal({ type: "member-add" }, actionTarget);
          } else if (action === "member-assistant-toggle") {
            var assistantOptionsPanel = shell && shell.querySelector("[data-modal=assistant] + .ops-member-assistant-trigger + .ops-member-assistant-options");
            if (assistantOptionsPanel) {
              var willOpen = assistantOptionsPanel.hidden;
              assistantOptionsPanel.hidden = !willOpen;
              actionTarget.setAttribute("aria-expanded", willOpen ? "true" : "false");
            }
          } else if (action === "member-assistant-select") {
            var assistantField = shell && shell.querySelector('[data-modal="assistant"]');
            var assistantTrigger = shell && shell.querySelector(".ops-member-assistant-trigger");
            var assistantPanel = shell && shell.querySelector(".ops-member-assistant-options");
            if (assistantField && assistantTrigger && assistantPanel) {
              var assistantName = actionTarget.getAttribute("data-value") || "";
              var assistantAccount = actionTarget.getAttribute("data-account") || "";
              var assistantPhone = actionTarget.getAttribute("data-phone") || "";
              assistantField.value = assistantName;
              var assistantValue = assistantTrigger.querySelector(".ops-member-assistant-value");
              if (assistantValue) assistantValue.innerHTML = '<span class="ops-member-assistant-option-name">' + escapeHtml(assistantName) + '</span><span class="ops-member-assistant-option-meta">账号：' + escapeHtml(assistantAccount) + '　手机号：' + escapeHtml(assistantPhone) + '</span>';
              Array.prototype.forEach.call(assistantPanel.querySelectorAll(".ops-member-assistant-option"), function (option) {
                var selected = option === actionTarget;
                option.classList.toggle("is-selected", selected);
                option.setAttribute("aria-selected", selected ? "true" : "false");
              });
              assistantPanel.hidden = true;
              assistantTrigger.setAttribute("aria-expanded", "false");
              assistantTrigger.focus();
            }
          } else if (action === "member-adjust") {
            openModal({ type: "member-adjust", id: actionTarget.getAttribute("data-id") }, actionTarget);
          } else if (action === "member-view") {
            openModal({ type: "member-view", id: actionTarget.getAttribute("data-id") }, actionTarget);
          } else if (action === "member-batch") {
            if (!state.selectedMembers.length) { toast("请先选择需要修改的成员"); return; }
            openModal({ type: "member-batch" }, actionTarget);
          } else if (action === "member-delete") {
            if (!state.selectedMembers.length) { toast("请先选择需要删除的成员"); return; }
            openModal({ type: "confirm", title: "删除成员分配", message: "确定删除已选择的 " + state.selectedMembers.length + " 条成员分配吗？", danger: true, confirmAction: "member-delete", ids: state.selectedMembers.slice(), success: "成员分配已删除" }, actionTarget);
          } else if (action === "member-delete-one") {
            openModal({ type: "confirm", title: "删除成员分配", message: "确定删除该成员分配吗？", danger: true, confirmAction: "member-delete", ids: [actionTarget.getAttribute("data-id")], success: "成员分配已删除" }, actionTarget);
          } else if (action === "member-reset" || action === "member-search") {
            toast(action === "member-reset" ? "查询条件已重置" : "查询完成");
          } else if (action === "member-page-prev" || action === "member-page-next") {
            state.memberPage += action === "member-page-next" ? 1 : -1;
            state.memberPage = Math.max(1, Math.min(Math.ceil(memberRows.length / 5), state.memberPage));
            render();
          } else if (action === "member-transfer-toggle") {
            state.memberTransferOn = !state.memberTransferOn;
            render();
          } else if (action === "rule-edit") {
            state.rulesEditing = true;
            state.ruleTimePickerOpen = false;
            render();
          } else if (action === "rule-toggle") {
            if (!state.rulesEditing) return;
            var key = actionTarget.getAttribute("data-key");
            state.rules[key] = !state.rules[key];
            render();
          } else if (action === "rule-reset") {
            if (!state.rulesEditing) return;
            state.rules = { timeoutMark: true, sms: true, workEnabled: true, workThreshold: "15", workCountdown: "5", workTime: "09:00 - 18:00", offEnabled: true, offThreshold: "30", offCountdown: "10", privateChat: true, groupChat: true };
            state.ruleTimePickerOpen = false;
            toast("已恢复默认配置");
          } else if (action === "rule-save") {
            if (!state.rulesEditing) return;
            state.rulesEditing = false;
            state.ruleTimePickerOpen = false;
            toast("会话规则已保存");
          } else if (action === "rule-time-open") {
            if (!state.rulesEditing) return;
            state.ruleTimePickerOpen = true;
            render();
            window.requestAnimationFrame(function () {
              var startTime = shell && shell.querySelector("[data-rule-time-start]");
              if (startTime) startTime.focus();
            });
          } else if (action === "rule-time-cancel") {
            state.ruleTimePickerOpen = false;
            render();
            window.requestAnimationFrame(function () {
              var timeTrigger = shell && shell.querySelector(".ops-time-range-trigger");
              if (timeTrigger) timeTrigger.focus();
            });
          } else if (action === "rule-time-apply") {
            var startField = shell && shell.querySelector("[data-rule-time-start]");
            var endField = shell && shell.querySelector("[data-rule-time-end]");
            var startValue = startField ? startField.value : "";
            var endValue = endField ? endField.value : "";
            if (!startValue || !endValue) { toast("请选择完整的工作时间"); return; }
            if (startValue >= endValue) { toast("结束时间需晚于开始时间"); return; }
            state.rules.workTime = startValue + " - " + endValue;
            state.ruleTimePickerOpen = false;
            toast("工作时间已更新");
          } else if (action === "modal-close" || action === "modal-backdrop") {
            closeModal();
          } else if (action === "modal-save") {
            saveModal();
          } else if (action === "modal-confirm") {
            confirmModalAction();
          }
        }

        function clearMaterialDragState() {
          if(state.modal&&state.modal.type==="material-groups")delete state.modal.dragIndex;
          if(shell)shell.querySelectorAll('.ops-group-manager-row.is-dragging, .ops-group-manager-row.is-drag-over').forEach(function(row){row.classList.remove('is-dragging','is-drag-over');});
          if (shell) {
            shell.querySelectorAll(".ops-group-row.is-dragging, .ops-group-row.is-drag-over").forEach(function (row) {
              row.classList.remove("is-dragging", "is-drag-over");
            });
          }
          state.materialDraggedGroup = "";
        }

        function handleMaterialDragStart(event) {
          var managerHandle=event.target.closest('[data-material-manager-drag]');
          if(managerHandle&&state.modal&&state.modal.type==="material-groups"&&!state.modal.groupEditor){
            state.modal.dragIndex=Number(managerHandle.getAttribute('data-material-manager-drag'));
            if(event.dataTransfer){event.dataTransfer.effectAllowed="move";event.dataTransfer.setData("text/plain","material-manager:"+state.modal.dragIndex);}
            managerHandle.closest('.ops-group-manager-row').classList.add('is-dragging');return;
          }
          var handle = event.target.closest("[data-material-group-drag]");
          if (!handle || currentRoute() !== "materials") return;
          var name = handle.getAttribute("data-material-group-drag") || "";
          if (!name) return;
          state.materialDraggedGroup = name;
          if (event.dataTransfer) {
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.setData("text/plain", name);
          }
          var row = handle.closest("[data-material-group-row]");
          if (row) row.classList.add("is-dragging");
        }

        function handleMaterialDragOver(event) {
          var managerRow=event.target.closest('[data-material-manager-index]');
          if(managerRow&&state.modal&&state.modal.type==="material-groups"&&Number.isInteger(state.modal.dragIndex)){
            event.preventDefault();if(event.dataTransfer)event.dataTransfer.dropEffect="move";
            shell.querySelectorAll('.ops-group-manager-row.is-drag-over').forEach(function(row){row.classList.remove('is-drag-over');});managerRow.classList.add('is-drag-over');return;
          }
          if(event.target.closest("[data-material-drop]")){event.preventDefault();if(event.dataTransfer)event.dataTransfer.dropEffect="copy";return;}
          var row = event.target.closest("[data-material-group-row]");
          var targetName = row && row.getAttribute("data-material-group-row");
          if (!row || !state.materialDraggedGroup || targetName === "全部素材" || targetName === state.materialDraggedGroup) return;
          event.preventDefault();
          if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
          if (shell) shell.querySelectorAll(".ops-group-row.is-drag-over").forEach(function (item) { item.classList.remove("is-drag-over"); });
          row.classList.add("is-drag-over");
        }

        function handleMaterialDrop(event) {
          var managerRow=event.target.closest('[data-material-manager-index]');
          if(managerRow&&state.modal&&state.modal.type==="material-groups"&&Number.isInteger(state.modal.dragIndex)){
            event.preventDefault();var fromIndex=state.modal.dragIndex,toIndex=Number(managerRow.getAttribute('data-material-manager-index'));clearMaterialDragState();moveMaterialManagerGroup(fromIndex,toIndex);return;
          }
          var upload=event.target.closest("[data-material-drop]");if(upload){event.preventDefault();acceptMaterialFile(upload.getAttribute("data-material-drop"),event.dataTransfer&&event.dataTransfer.files);return;}
          var row = event.target.closest("[data-material-group-row]");
          var targetName = row && row.getAttribute("data-material-group-row");
          var draggedName = state.materialDraggedGroup || (event.dataTransfer && event.dataTransfer.getData("text/plain"));
          if (!row || !draggedName || targetName === "全部素材" || targetName === draggedName) {
            clearMaterialDragState();
            return;
          }
          event.preventDefault();
          var order = (state.materialGroupOrder[state.materialTab] || []).slice();
          var fromIndex = order.indexOf(draggedName);
          var targetIndex = order.indexOf(targetName);
          if (fromIndex < 0 || targetIndex < 0) {
            clearMaterialDragState();
            return;
          }
          order.splice(fromIndex, 1);
          targetIndex = order.indexOf(targetName);
          order.splice(targetIndex, 0, draggedName);
          state.materialGroupOrder[state.materialTab] = order;
          clearMaterialDragState();
          render();
          toast("素材分组排序已更新");
        }

        function updateInlinePatientBasic(target) {
          var field=target.getAttribute("data-basic-inline");
          if ((field!=="birthDate" && field!=="height") || !target.closest(".cp-basic-info")) return false;
          var valid=target.checkValidity();
          target.setAttribute("aria-invalid",String(!valid));
          var error=target.closest(".cp-inline-field").querySelector(".cp-inline-error");
          error.textContent=valid?"":(field==="height"?"请输入 0–250 cm 的身高":"请输入有效生日");
          if(valid){state.chatPatientBasic[field]=target.value;chatPatientBasics[state.chatBasicScope||state.chatConversationSelectedKey||state.chatSelected]=state.chatPatientBasic;}
          return true;
        }

        function handleInput(event) {
          if(captureHandoffInput(event.target))return;
          if (updateInlinePatientBasic(event.target)) return;
          if (event.target.matches && event.target.matches('[data-material-rich-text]')) {
            var richTextValue = materialRichTextValue(event.target);
            state.materialDraft.text = richTextValue;
            var richTextField = shell && shell.querySelector('[data-bind="material.text"]');
            if (richTextField) richTextField.value = richTextValue;
            var richTextCounter = document.getElementById('ops-material-count-text');
            if (richTextCounter) richTextCounter.textContent = richTextValue.length + '/200';
            return;
          }
          if (state.modal && state.modal.type === "health-add" && event.target.closest && event.target.closest('[data-health-entry]')) { syncHealthEntryModal(); updateHealthEntryModalProgress(); return; }
          if (state.modal && (state.modal.type === "material-groups" || state.modal.type === "chat-material-create")) {
            if(state.modal.type==='material-groups'&&state.modal.groupEditor){
              if(event.target.matches('[data-modal="newGroupDialog"]')){state.modal.newGroup=event.target.value;state.modal.groupEditor.error='';var groupError=shell.querySelector('.ops-group-editor-error');if(groupError){groupError.hidden=true;groupError.textContent='';groupError.removeAttribute('role');}var groupConfirm=shell.querySelector('.ops-group-editor-dialog [data-action="material-group-create"]');if(groupConfirm)groupConfirm.disabled=!event.target.value.trim();}
              return;
            }
            if (event.target.hasAttribute("data-material-group-index")) {
              var groupIndex = Number(event.target.getAttribute("data-material-group-index"));
              if (state.modal.groups[groupIndex]) state.modal.groups[groupIndex].name = event.target.value;
            }
          }
          var bind = event.target.getAttribute("data-bind");
          if (bind) {
            var parts = bind.split(".");
            if (bind === "material.search") state.materialSearch = event.target.value;
            else if (parts[0] === "material") {
              state.materialDraft[parts[1]] = event.target.value;
              var materialCounter = document.getElementById("ops-material-count-" + parts[1]);
              if (materialCounter) materialCounter.textContent = event.target.value.length + "/" + event.target.maxLength;
            }
            else if (parts[0] === "messageFilter") state.messageFilterDraft[parts[1]] = event.target.value;
            else if (parts[0] === "message") {
              state.messageDraft[parts[1]] = event.target.value;
              if (parts[1] === "content") {
                var preview = document.getElementById("ops-message-preview");
                if (preview) preview.textContent = event.target.value || "消息内容将在此处预览";
              }
            } else if (bind === "patient.tagSearch") {
              state.patientArchiveTagSearch = event.target.value;
              filterPatientArchiveTagOptions(event.target.value);
            } else if (parts[0] === "patient") {
              state.patientArchiveDraft[parts[1]] = event.target.value;
            } else if (parts[0] === "opsPatient") {
              state.opsPatientDraft[parts[1]] = event.target.value;
            } else if (bind === "label.search") state.labelSearch = event.target.value;
            else if (bind === "chat.doctorSearch") {
              state.chatDoctorSearch = event.target.value;
              filterChatDoctors(event.target.value);
            } else if (bind === "chat.conversationSearch") {
              state.chatConversationSearch = event.target.value;
              filterChatConversations();
            } else if (bind === "chat.queryName") {
              state.chatQueryDraft.name = event.target.value;
            } else if (bind === "chat.queryContent") {
              state.chatQueryDraft.content = event.target.value;
            } else if (bind === "chat.queryStartDate") {
              state.chatQueryDraft.startDate = event.target.value;
            } else if (bind === "chat.queryEndDate") {
              state.chatQueryDraft.endDate = event.target.value;
            } else if (bind === "chat.materialSearch") {
              state.chatMaterialSearch = event.target.value;
              filterChatMaterials(event.target.value);
            } else if (bind === "chat.historySearch") {
              state.chatHistorySearch = event.target.value;
              filterChatHistory();
            } else if (bind === "chat.patientTagSearch") {
              if (state.modal && (state.modal.type === "chat-patient-tags" || state.modal.type === "patient-archive-tags")) { state.modal.patientTagSearch = event.target.value; state.modal.tagPage = 1; }
              filterPatientTagOptions(event.target.value);
            } else if (bind === "chat.followupDate") {
              if (event.target.value && event.target.value > todayLocalIso()) {
                event.target.value = state.chatFollowupDate;
                toast("跟进日期不能晚于今天");
              } else state.chatFollowupDate = event.target.value;
            } else if (bind === "chat.followupContent") {
              if (event.target.value.length > 500) event.target.value = event.target.value.slice(0, 500);
              state.chatFollowupContent = event.target.value;
              var followupCounter = document.querySelector("[data-chat-followup-count]");
              if (followupCounter) followupCounter.textContent = state.chatFollowupContent.length + " / 500";
            } else if (bind === "chat.draft") state.chatDraft = event.target.value;
          }
          var ruleKey = event.target.getAttribute("data-rule");
          if (ruleKey && state.rulesEditing) state.rules[ruleKey] = event.target.value;
        }

        function handleChange(event) {
          if (state.modal && state.modal.type === "health-add" && event.target.closest && event.target.closest('[data-health-entry]')) { syncHealthEntryModal(); updateHealthEntryModalProgress(); return; }
          if(event.target.hasAttribute("data-material-scope")){if(state.modal && state.modal.type === "chat-material-create" && event.target.getAttribute("data-material-scope") !== "个人素材")return;state.materialDraft.scope=event.target.getAttribute("data-material-scope");state.materialDraft.group="";render();return;}
          if(event.target.hasAttribute("data-material-file")){acceptMaterialFile(event.target.getAttribute("data-material-file"),event.target.files);return;}
          if(event.target.getAttribute("data-bind")==="material.group"){state.materialDraft.group=event.target.value;return;}
          if(captureHandoffInput(event.target))return;
          if (updateInlinePatientBasic(event.target)) return;
          if (event.target.getAttribute("data-change-action") === "chat-material-type") {
            state.chatMaterialType = event.target.value || "全部类型";
            render();
            return;
          }
          if (event.target.getAttribute("data-change-action") === "chat-material-tenant") {
            if(state.chatMaterialScope !== "租户素材" || !quickReplyTenants.some(function(tenant){return tenant.id===event.target.value;}))return;
            state.chatMaterialTenant = event.target.value;
            state.chatMaterialSearch = "";
            state.chatMaterialGroup = "全部素材";
            state.chatMaterialType = "全部类型";
            state.chatMaterialCollapsed = {};
            render();
            return;
          }
          if (event.target.getAttribute("data-change-action") === "chat-material-group") {
            state.chatMaterialGroup = event.target.value || "全部素材";
            render();
            return;
          }
          if (event.target.getAttribute("data-change-action") === "chat-archive-scene") {
            state.chatArchiveScene = event.target.value || "慢病随访";
            state.chatArchiveTab = "病例时间轴";
            state.chatArchiveMetric = 0;
            render();
            return;
          }
          if (event.target.getAttribute("data-change-action") === "chat-ai-summary-scene") {
            state.chatArchiveScene = event.target.value || "慢病随访";
            state.chatArchiveTab = "病例时间轴";
            state.chatArchiveMetric = 0;
            state.chatArchiveTimelineDetail = null;
            state.chatArchiveTabsExpanded = false;
            state.chatAiAutoStartedKey = "";
            render();
            return;
          }
          if (event.target.getAttribute("data-change-action") === "chat-patient-tag-scope") {
            if (state.modal && (state.modal.type === "chat-patient-tags" || state.modal.type === "patient-archive-tags")) {
              state.modal.tagScope = event.target.value || "个人标签";
              state.modal.tagPage = 1;
              refreshPatientTagModal();
            }
            return;
          }
          var changedBind = event.target.getAttribute("data-bind") || "";
          if (changedBind === "message.sendType") {
            state.messageDraft.sendType = event.target.value;
            if (event.target.value === "立即发送") state.messageDraft.sendAt = "";
            render();
          } else if (changedBind.indexOf("patient.") === 0 && changedBind !== "patient.tagSearch") {
            state.patientArchiveDraft[changedBind.split(".")[1]] = event.target.value;
          } else if (changedBind.indexOf("opsPatient.") === 0) {
            state.opsPatientDraft[changedBind.split(".")[1]] = event.target.value;
          } else if (changedBind === "chat.historySender") {
            state.chatHistorySender = event.target.value;
            filterChatHistory();
          }
          if (event.target.hasAttribute("data-purpose")) {
            var purpose = event.target.getAttribute("data-purpose");
            var index = state.materialDraft.purposes.indexOf(purpose);
            if (event.target.checked && index < 0) state.materialDraft.purposes.push(purpose);
            if (!event.target.checked && index >= 0) state.materialDraft.purposes.splice(index, 1);
          }
          if (event.target.hasAttribute("data-recipient")) {
            var recipient = event.target.getAttribute("data-recipient");
            var recipientIndex = state.selectedRecipients.indexOf(recipient);
            if (event.target.checked && recipientIndex < 0) state.selectedRecipients.push(recipient);
            if (!event.target.checked && recipientIndex >= 0) state.selectedRecipients.splice(recipientIndex, 1);
            render();
          }
          if (event.target.hasAttribute("data-recipient-all")) {
            state.selectedRecipients = event.target.checked ? recipients.map(function (item) { return item.id; }) : [];
            render();
          }
          if (event.target.hasAttribute("data-member")) {
            var member = event.target.getAttribute("data-member");
            var memberIndex = state.selectedMembers.indexOf(member);
            if (event.target.checked && memberIndex < 0) state.selectedMembers.push(member);
            if (!event.target.checked && memberIndex >= 0) state.selectedMembers.splice(memberIndex, 1);
            render();
          }
          if (event.target.hasAttribute("data-message-send")) {
            state.messageDraft.sendType = event.target.getAttribute("data-message-send");
          }
          if (event.target.hasAttribute("data-disease")) {
            state.messageDraft.diagnosis = event.target.getAttribute("data-disease");
          }
          if (event.target.hasAttribute("data-rule-check")) {
            if (state.rulesEditing) state.rules[event.target.getAttribute("data-rule-check")] = event.target.checked;
          }
        }

        var chatWorkbenchDragState = null;
        function clearChatWorkbenchDragState() {
          if (shell) shell.querySelectorAll('[data-chat-workbench-tabs] button.is-dragging, [data-chat-workbench-tabs] button.is-drop-target').forEach(function (button) { button.classList.remove('is-dragging', 'is-drop-target'); });
          chatWorkbenchDragState = null;
        }
        function handleChatWorkbenchDragStart(event) {
          var button = event.target.closest('[data-chat-workbench-tab-id]');
          if (!button) return;
          var id = button.getAttribute('data-chat-workbench-tab-id') || '';
          if (!id) return;
          chatWorkbenchDragState = { id: id };
          button.classList.add('is-dragging');
          if (event.dataTransfer) {
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('text/plain', id);
          }
        }
        function handleChatWorkbenchDragOver(event) {
          var button = event.target.closest('[data-chat-workbench-tab-id]');
          if (!button || !chatWorkbenchDragState || button.getAttribute('data-chat-workbench-tab-id') === chatWorkbenchDragState.id) return;
          event.preventDefault();
          if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
          if (shell) shell.querySelectorAll('[data-chat-workbench-tabs] button.is-drop-target').forEach(function (item) { item.classList.remove('is-drop-target'); });
          button.classList.add('is-drop-target');
        }
        function handleChatWorkbenchDrop(event) {
          var button = event.target.closest('[data-chat-workbench-tab-id]');
          if (!button || !chatWorkbenchDragState) return;
          event.preventDefault();
          var fromId = chatWorkbenchDragState.id;
          var targetId = button.getAttribute('data-chat-workbench-tab-id') || '';
          if (!targetId || fromId === targetId) { clearChatWorkbenchDragState(); return; }
          var conversation = selectedChatConversation();
          var context = window.ChatPatientArchive.context(conversation, state.chatDoctorSelected, state.chatArchiveScene);
          var environment = window.SidebarConfig.environment();
          var ids = window.SidebarConfig.visible(context, environment, 'web').map(function (tab) { return tab.id; });
          var fromIndex = ids.indexOf(fromId), targetIndex = ids.indexOf(targetId);
          if (fromIndex < 0 || targetIndex < 0) { clearChatWorkbenchDragState(); return; }
          ids.splice(fromIndex, 1);
          targetIndex = ids.indexOf(targetId);
          ids.splice(targetIndex, 0, fromId);
          var saved = window.SidebarConfig.saveOrder(context, environment, ids);
          clearChatWorkbenchDragState();
          if (saved) toast('工作台标签顺序已保存');
          else { render({ preserveArchiveScroll: true }); toast('工作台标签顺序暂未保存'); }
        }
        var chatResizeState = null;
        function handleChatResizeStart(event) {
          var handle = event.target.closest("[data-chat-resize-handle]");
          if (!handle || state.chatWorkbenchCollapsed || window.innerWidth <= 1200) return;
          event.preventDefault();
          chatResizeState = { startX: event.clientX, startWidth: state.chatWorkbenchWidth };
          document.body.classList.add("ops-chat-resizing");
          handle.setPointerCapture && handle.setPointerCapture(event.pointerId);
        }
        function handleChatResizeMove(event) {
          if (!chatResizeState) return;
          var next = chatResizeState.startWidth - (event.clientX - chatResizeState.startX);
            state.chatWorkbenchWidth = Math.max(375, Math.min(1200, Math.round(next)));
          var layout = document.querySelector(".ops-chat-layout");
          if (layout && !state.chatWorkbenchCollapsed) layout.style.gridTemplateColumns = (state.chatDoctorPanelCollapsed ? "250px " : "168px 250px ") + "minmax(420px, 1fr) 6px " + state.chatWorkbenchWidth + "px";
          updateArchiveLayout();
        }
        function handleChatResizeEnd() {
          if (!chatResizeState) return;
          chatResizeState = null;
          document.body.classList.remove("ops-chat-resizing");
        }

        var chatMaterialTypeScrollState=null;
        var chatMaterialTypeScrollSuppressed=null;
        function chatMaterialTypeStrip(event) {
          var target=event && event.target;
          return target && target.closest ? target.closest('.ops-quick-reply-page.ops-chat-workbench .ops-material-type-tabs') : null;
        }
        function updateChatMaterialTypeScrollCue(strip) {
          if(!strip)return;
          var maximum=Math.max(0,strip.scrollWidth-strip.clientWidth);
          strip.classList.toggle('is-at-end',maximum<=1 || strip.scrollLeft>=maximum-1);
          strip.classList.toggle('is-scrollable',maximum>1);
        }
        function handleChatMaterialTypePointerDown(event) {
          var strip=chatMaterialTypeStrip(event);
          if(!strip || (event.button!==undefined && event.button!==0))return;
          updateChatMaterialTypeScrollCue(strip);
          if(strip.scrollWidth<=strip.clientWidth)return;
          chatMaterialTypeScrollState={strip:strip,id:event.pointerId,x:event.clientX,y:event.clientY,left:strip.scrollLeft,moved:false};
        }
        function handleChatMaterialTypePointerMove(event) {
          var drag=chatMaterialTypeScrollState;
          if(!drag || drag.id!==event.pointerId)return;
          var dx=event.clientX-drag.x,dy=event.clientY-drag.y;
          if(!drag.moved && Math.abs(dx)>6 && Math.abs(dx)>Math.abs(dy)){
            drag.moved=true;
            drag.strip.classList.add('is-dragging');
            if(drag.strip.setPointerCapture)drag.strip.setPointerCapture(event.pointerId);
          }
          if(drag.moved){
            event.preventDefault();
            drag.strip.scrollLeft=Math.max(0,Math.min(drag.strip.scrollWidth-drag.strip.clientWidth,drag.left-dx));
            updateChatMaterialTypeScrollCue(drag.strip);
          }
        }
        function handleChatMaterialTypePointerEnd(event) {
          var drag=chatMaterialTypeScrollState;
          if(!drag || drag.id!==event.pointerId)return;
          if(drag.moved)chatMaterialTypeScrollSuppressed={strip:drag.strip,until:Date.now()+400};
          drag.strip.classList.remove('is-dragging');
          if(drag.strip.hasPointerCapture && drag.strip.hasPointerCapture(event.pointerId))drag.strip.releasePointerCapture(event.pointerId);
          chatMaterialTypeScrollState=null;
        }
        function handleChatMaterialTypeClickGuard(event) {
          if(chatMaterialTypeScrollSuppressed && Date.now()<chatMaterialTypeScrollSuppressed.until && chatMaterialTypeScrollSuppressed.strip.contains(event.target)){
            event.preventDefault();
            event.stopImmediatePropagation();
            chatMaterialTypeScrollSuppressed=null;
          } else if(chatMaterialTypeScrollSuppressed)chatMaterialTypeScrollSuppressed=null;
        }
        function handleChatMaterialTypeWheel(event) {
          var strip=chatMaterialTypeStrip(event);
          if(!strip || event.ctrlKey || Math.abs(event.deltaX)>Math.abs(event.deltaY))return;
          var maximum=Math.max(0,strip.scrollWidth-strip.clientWidth);
          if(maximum<=1)return;
          var delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?strip.clientWidth:1);
          var next=Math.max(0,Math.min(maximum,strip.scrollLeft+delta));
          if(next!==strip.scrollLeft){strip.scrollLeft=next;updateChatMaterialTypeScrollCue(strip);event.preventDefault();}
        }
        function handleChatMaterialTypeScroll(event) {
          var strip=event.target && event.target.matches && event.target.matches('.ops-material-type-tabs') ? event.target : null;
          if(strip)updateChatMaterialTypeScrollCue(strip);
        }

        function handleKeydown(event) {
          if(event.target.matches&&event.target.matches('[data-bind^="chat."]')&&(event.isComposing||event.keyCode===229||inboxCompositionNode===event.target))return;
          if (event.key === 'Escape' && shell && shell.querySelector('.ops-material-parameter-menu:not([hidden]),.ops-material-help-popover:not([hidden])')) {
            event.preventDefault();
            var floatingTrigger = shell.querySelector('[data-action="material-param-toggle"][aria-expanded="true"],.ops-material-help-trigger[aria-expanded="true"]');
            closeMaterialHelpPopovers();
            if (floatingTrigger) floatingTrigger.focus();
            return;
          }
          if (event.key === "Enter" && event.target.id === "ops-material-search") {
            event.preventDefault();
            state.materialApplied = state.materialSearch.trim();
            render();
            toast("查询完成");
            return;
          }
          if (event.key === "Enter" && event.target.matches('[data-bind^="chat.query"]')) {
            event.preventDefault();
            runChatQuery();
            return;
          }
          if (event.key === "Enter" && !event.shiftKey && event.target.matches('[data-bind="chat.draft"]')) {
            event.preventDefault();
            sendChatMessage();
            return;
          }
          if (event.key === "Enter" && event.target.matches('[data-bind="patient.tagSearch"]')) {
            event.preventDefault();
            var firstArchiveTagOption = shell && shell.querySelector("[data-patient-archive-tag-option]:not([hidden])");
            if (firstArchiveTagOption) selectPatientArchiveTag(firstArchiveTagOption.getAttribute("data-tag"));
            else toast("暂无匹配的标签名称");
            return;
          }

          if (event.key === "Escape" && state.messageMaterialOpen && !state.modal) {
            event.preventDefault();
            state.messageMaterialOpen = false;
            render();
            return;
          }
          if (event.key === "Escape" && state.patientArchiveTagOpen && !state.modal) {
            event.preventDefault();
            state.patientArchiveTagOpen = false;
            render();
            return;
          }
          if (!state.modal) return;
          if(state.modal.type==='material-groups'&&state.modal.groupEditor){
            if(event.isComposing||event.keyCode===229)return;
            if(event.key==='Escape'){event.preventDefault();cancelMaterialGroupEditor();return;}
            if(event.key==='Enter'&&event.target.matches('[data-modal="newGroupDialog"]')){event.preventDefault();createMaterialGroup();return;}
            if(event.key==='Tab'){
              var editor=shell&&shell.querySelector('.ops-group-editor-dialog'),controls=editor?Array.prototype.slice.call(editor.querySelectorAll('input,button:not([disabled])')):[],firstControl=controls[0],lastControl=controls[controls.length-1];
              if(event.shiftKey&&document.activeElement===firstControl){event.preventDefault();lastControl.focus();}else if(!event.shiftKey&&document.activeElement===lastControl){event.preventDefault();firstControl.focus();}
            }
            return;
          }
          if(state.modal.type==="material-groups"&&event.target.matches('[data-material-manager-drag]')&&(event.key==="ArrowUp"||event.key==="ArrowDown")){
            event.preventDefault();var managerIndex=Number(event.target.getAttribute('data-material-manager-drag'));moveMaterialManagerGroup(managerIndex,managerIndex+(event.key==="ArrowUp"?-1:1));return;
          }
          if (event.key === "Enter" && (state.modal.type === "chat-patient-tags" || state.modal.type === "patient-archive-tags") && event.target.matches('[data-modal="patientTag"]')) {
            event.preventDefault();
            var firstPatientTagOption = shell && shell.querySelector("[data-patient-tag-option]:not([hidden])");
            if (firstPatientTagOption) selectPatientTag(firstPatientTagOption.getAttribute("data-tag"));
            else toast("暂无匹配的标签名称");
            return;
          }
          if (event.key === "Escape") {
            event.preventDefault();
            closeModal();
            return;
          }
          if (event.key === "Tab") {
            var focusable = shell ? Array.prototype.slice.call(shell.querySelectorAll(".ops-modal button:not([disabled]), .ops-modal input:not([disabled]), .ops-modal select:not([disabled]), .ops-modal textarea:not([disabled]), .ops-modal [tabindex='0']")).filter(function (item) { return item.offsetParent !== null; }) : [];
            if (!focusable.length) return;
            var first = focusable[0];
            var last = focusable[focusable.length - 1];
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
          }
        }

        function enhanceNativeSidebar() {
          if (isOpsRoute()) return;
          var sidebar = document.querySelector(".sidebar");
          if (!sidebar) return;
          var definitions = {
            "患者管理": [{ label: "标签管理", route: "tag-management" }],
            "会话管理": [{ label: "聚合聊天", route: "aggregate-chat", openInNewWindow: true }, { label: "成员分配与接待管理", route: "member-assignment" }],
            "运营管理": [{ label: "素材管理", route: "materials" }, { label: "消息触达", route: "message-tasks" }]
          };
          sidebar.querySelectorAll(".nav-group").forEach(function (group) {
            var buttonNode = group.querySelector(":scope > .nav-item");
            var labelNode = buttonNode && buttonNode.querySelector("span");
            var label = labelNode ? labelNode.textContent.trim() : "";
            if (!definitions[label] || group.querySelector(".v3-native-subnav")) return;
            var subnav = document.createElement("div");
            subnav.className = "subnav v3-native-subnav";
            subnav.hidden = true;
            definitions[label].forEach(function (child) {
              var childButton = document.createElement(child.openInNewWindow ? "a" : "button");
              childButton.textContent = child.label;
              if (child.openInNewWindow) {
                var childWindowUrl = new URL(window.location.href);
                childWindowUrl.searchParams.set("standalone", "aggregate-chat");
                childWindowUrl.hash = child.route;
                childButton.href = childWindowUrl.toString();
                childButton.target = "_blank";
                childButton.rel = "noopener noreferrer";
                childButton.setAttribute("aria-label", child.label + "（新标签页打开）");
                childButton.title = "新标签页打开";
              } else {
                childButton.type = "button";
                childButton.setAttribute("data-route", child.route);
              }
              subnav.appendChild(childButton);
            });
            group.appendChild(subnav);
            buttonNode.setAttribute("aria-expanded", "false");
          });
        }

        function handleNativeParent(event) {
          var buttonNode = event.target.closest(".sidebar .nav-item");
          if (!buttonNode) return;
          var labelNode = buttonNode.querySelector("span");
          var label = labelNode ? labelNode.textContent.trim() : "";
          if (["患者管理", "会话管理", "运营管理"].indexOf(label) < 0) return;
          var group = buttonNode.closest(".nav-group");
          var subnav = group && group.querySelector(".v3-native-subnav");
          if (!subnav) return;
          event.preventDefault();
          event.stopImmediatePropagation();
          subnav.hidden = !subnav.hidden;
          buttonNode.setAttribute("aria-expanded", subnav.hidden ? "false" : "true");
        }

        function scheduleNativeEnhancement() {
          if (nativeObserverQueued) return;
          nativeObserverQueued = true;
          window.requestAnimationFrame(function () {
            nativeObserverQueued = false;
            if (isOpsRoute()) render();
            else enhanceNativeSidebar();
          });
        }

        function initializeOpsPrototype() {
          // All parser-loaded shared scripts are available after DOMContentLoaded.
          // Archive ownership never determines the explicit synthetic recorder.
          window.PatientFollowups.setOperator({id:'operator-demo-admin',name:'管理员',role:'admin'});
          if(!quickRepliesStandalone&&!patientProfileStandalone&&!patientFollowupsStandalone&&!aiSummaryStandalone){conversationInbox=window.ConversationInboxHost.create({sources:getChatSourceData,messages:function(row){return row.name==='王德华'?chatMessages.slice():row.messages.slice().reverse().map(function(text,index){var m=parseConversationMessage(text,row);return {side:/医生|医助/.test(m.name)?'self':'other',name:m.name,time:row.date+' 09:'+String(1+index*4).padStart(2,'0'),text:m.text};});},context:function(row,doctor,scene){var c=window.ChatPatientArchive.context(row,doctor,scene);c.sceneCode=window.PatientHandoffs.sceneCode(c.projectId,c.sceneName);return c;},onChange:chatInboxChange});conversationInbox.store.subscribe(chatInboxChange);window.PrototypeConversationInbox=conversationInbox;conversationInbox.current=chatInboxSelected;}

          window.PatientHandoffs.mount(function(){render({preserveArchiveScroll:true,preserveChatScroll:true,preserveChatInput:true});});
          window.DoctorReception.subscribe(function(){if(conversationInbox)conversationInbox.sync();if(shell&&(shell.querySelector('.ops-chat-page')||shell.querySelector('.ho-panel')||state.modal&&state.modal.type==='transfer'))render({preserveArchiveScroll:true,preserveChatScroll:true,preserveChatInput:true});});
          window.addEventListener('storage',function(event){if(conversationInbox&&event.key===window.ConversationInbox.KEY){conversationInbox.store.refresh();chatInboxChange();}if(event.key===chatOutboxKey){chatOutbox=readChatOutbox();if(shell&&shell.querySelector('.ops-chat-page'))render();}});
          window.PrototypeHandoffHost={context:getHandoffContext,receiveAssistantReply:function(ctx,receipt){
            var result=window.PatientHandoffs.receiveReply(ctx,receipt);
            if(result.ok&&!result.idempotent&&conversationInbox){var row=conversationInbox.rows(ctx.doctorName).find(function(item){return ctx.inboxConversationKey?item.inboxKey===ctx.inboxConversationKey:item.patientId===ctx.patientId&&item.conversationId===ctx.patientId;}),c=row&&conversationInbox.find(row,ctx.doctorName);if(c)conversationInbox.store.recordMessage({id:receipt.messageId,conversationKey:c.key,speakerId:receipt.authorId,kind:'human',speakerName:result.record.to.name,text:receipt.text,sentAt:receipt.sentAt||Date.now()});}
            if(result.ok&&!result.idempotent&&JSON.stringify(ctx)===JSON.stringify(getHandoffContext())){
              var reply={side:'self',name:result.record.to.name,time:'刚刚',text:receipt.text};
              if(state.chatSelected==='王德华')state.chatMessages.push(reply);else{if(!state.chatConversationReplies[state.chatSelected])state.chatConversationReplies[state.chatSelected]=[];state.chatConversationReplies[state.chatSelected].push(reply);}
              render();
            }
            return result;
          }};
          window.PrototypeHandoffHost.receiveDoctorReply=window.PrototypeHandoffHost.receiveAssistantReply;
          window.addEventListener('message',function(event){
            if(event.origin!==window.location.origin||!event.data||event.data.type!=='my-todos-open-conversation'||!shell)return;
            var knownFrame=Array.prototype.some.call(shell.querySelectorAll('iframe.ops-my-todos-frame'),function(frame){return frame.contentWindow===event.source;});
            if(!knownFrame)return;
            var task=window.MyTodos.get(event.data.taskId);
            if(!task||task.type!=='conversation')return;
            var account=conversationInbox&&conversationInbox.accounts.find(function(a){return a.id===task.doctorId;}),target=account&&conversationInbox.rows(account.name).find(function(row){return row.type==='私聊'&&row.patientId===task.patientId&&row.conversationId===task.patientId;});
            if(conversationInbox&&!target)return;
            state.chatDoctorSelected=account?account.name:task.doctor||window.MyTodos.actor().name;state.modal=null;state.chatSubjectSelected=null;
            selectArchivePatient(target?target.name:task.patient,target&&target.inboxKey);state.chatArchiveScene=task.scene||'慢病随访';
            state.chatReadOnlyContext=chatNeedsHumanAttention(getHandoffContext())?null:chatOutboxScope(getHandoffContext());
            if(state.chatReadOnlyContext)state.chatDraft='';
            state.chatArchiveTab='病例时间轴';state.chatWorkbenchTab='我的待办';state.chatHistoryOpen=false;state.chatWorkbenchCollapsed=false;
            if(currentRoute()==='aggregate-chat')render();else navigate('aggregate-chat');
          });
          document.addEventListener("click", handleNativeParent, true);
          document.addEventListener("click", handleChatMaterialTypeClickGuard, true);
          document.addEventListener("click", handleClick, true);
          document.addEventListener('compositionstart',function(event){if(shell&&shell.contains(event.target)&&event.target.matches('input,textarea'))inboxCompositionNode=event.target;},true);
          document.addEventListener('compositionend',function(event){if(inboxCompositionNode!==event.target)return;inboxCompositionNode=null;if(inboxRenderDeferred){inboxRenderDeferred=false;chatInboxChange();}},true);
          document.addEventListener("input", handleInput, true);
          document.addEventListener("change", handleChange, true);
          document.addEventListener("pointerdown", handleChatResizeStart, true);
          document.addEventListener("pointermove", handleChatResizeMove, true);
          document.addEventListener("pointerup", handleChatResizeEnd, true);
          document.addEventListener("pointerdown", handleChatMaterialTypePointerDown, true);
          document.addEventListener("pointermove", handleChatMaterialTypePointerMove, true);
          document.addEventListener("pointerup", handleChatMaterialTypePointerEnd, true);
          document.addEventListener("pointercancel", handleChatMaterialTypePointerEnd, true);
          document.addEventListener("pointerdown", handleMaterialManagerPointerDown, true);
          document.addEventListener("pointermove", handleMaterialManagerPointerMove, true);
          document.addEventListener("pointerup", handleMaterialManagerPointerEnd, true);
          document.addEventListener("pointercancel", handleMaterialManagerPointerEnd, true);
          document.addEventListener("wheel", handleChatMaterialTypeWheel, {passive:false});
          document.addEventListener("scroll", handleChatMaterialTypeScroll, true);
          document.addEventListener("keydown", handleKeydown, true);
          document.addEventListener("submit",function(event){if(event.target.matches("[data-health-form]")){event.preventDefault();saveModal();}},true);
          document.addEventListener('submit',function(event){if(event.target.matches('[data-material-group-create-form]')){event.preventDefault();createMaterialGroup();}},true);
          window.addEventListener('resize',positionMaterialGroupEditor);
          if(window.visualViewport){window.visualViewport.addEventListener('resize',positionMaterialGroupEditor);window.visualViewport.addEventListener('scroll',positionMaterialGroupEditor);}
          document.addEventListener("dragstart", handleChatWorkbenchDragStart, true);
          document.addEventListener("dragover", handleChatWorkbenchDragOver, true);
          document.addEventListener("drop", handleChatWorkbenchDrop, true);
          document.addEventListener("dragend", clearChatWorkbenchDragState, true);
          document.addEventListener("dragstart", handleMaterialDragStart, true);
          document.addEventListener("dragover", handleMaterialDragOver, true);
          document.addEventListener("drop", handleMaterialDrop, true);
          document.addEventListener("dragend", clearMaterialDragState, true);
          window.addEventListener("hashchange", render);
          window.addEventListener("sidebar-config-changed",function(){render({preserveArchiveScroll:true});});
          window.addEventListener("resize", updateArchiveLayout);
          var rootNode = document.getElementById("root");
          if (rootNode) new MutationObserver(scheduleNativeEnhancement).observe(rootNode, { childList: true, subtree: true });
          render();
          scheduleNativeEnhancement();
        }

        if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initializeOpsPrototype);
        else initializeOpsPrototype();
      })();
    
