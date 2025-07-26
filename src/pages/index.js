import Layout from "@/components/Layout";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { LazyLoadImage } from "react-lazy-load-image-component";
import {
  CPUIcon,
  RAMIcon,
  StorageIcon,
  GraphicsIcon,
  GitHubIcon,
  EmailIcon,
  PhoneIcon,
  LaptopIcon,
  MacIcon,
  QQIcon,
  WeChatIcon,
  LinkIcon,
  UserIcon,
  PadIcon,
} from "@/components/Icon";

const Home = () => {
  return (
    <Layout title="关于 | 耿越">
      <div className="mb-8">
        <h1 className="font-extrabold text-3xl mb-6 sm:mb-2">关于</h1>

        <div className="flex flex-row space-x-4 items-center text-balance">
          <div className="w-2/3">
            <p className="font-medium text-lg sm:text-xl">
              你好👋! 我是<a href="https://hust.edu.cn">@华中科技大学</a>
              计算机科学与技术专业的一名大一新生。
            </p>
          </div>
          <div className="w-1/3">
            <LazyLoadImage
              effect="blur"
              src="/static/author.webp"
              className="rounded-full size-24 sm:size-36"
            />
          </div>
        </div>

        <h1 className="font-bold text-2xl my-6">我的设备</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <CardContent className="font-medium flex flex-col space-y-2">
              <p className="flex flex-row space-x-2 items-center">
                <CPUIcon /> <span>高通骁龙® 8 至尊领先版</span>
              </p>
              <p className="flex flex-row space-x-2 items-center">
                <RAMIcon /> <span>12GB + 12GB</span>
              </p>
              <p className="flex flex-row space-x-2 items-center">
                <StorageIcon /> <span>256GB</span>
              </p>
            </CardContent>
            <CardFooter className="flex flex-row justify-between items-center opacity-75 text-balance">
              <p className="text-sm">荣耀GT Pro（第一代）</p>
              <div>
                <PhoneIcon />
              </div>
            </CardFooter>
          </Card>

          <Card>
            <CardContent className="font-medium flex flex-col space-y-2">
              <p className="flex flex-row space-x-2 items-center">
                <CPUIcon /> <span>高通骁龙® 7 Gen 3</span>
              </p>
              <p className="flex flex-row space-x-2 items-center">
                <RAMIcon /> <span>12GB + 12GB</span>
              </p>
              <p className="flex flex-row space-x-2 items-center">
                <StorageIcon /> <span>256GB</span>
              </p>
            </CardContent>
            <CardFooter className="flex flex-row justify-between items-center opacity-75 text-balance">
              <p className="text-sm">荣耀平板10 （2025）</p>
              <div>
                <PadIcon />
              </div>
            </CardFooter>
          </Card>

          <Card>
            <CardContent className="font-medium flex flex-col space-y-2">
              <p className="flex flex-row space-x-2 items-center">
                <CPUIcon /> <span>Apple® M1</span>
              </p>
              <p className="flex flex-row space-x-2 items-center">
                <GraphicsIcon /> <span>7 核心 Apple® M1 集成显卡</span>
              </p>
              <p className="flex flex-row space-x-2 items-center">
                <RAMIcon /> <span>16GB</span>
              </p>
              <p className="flex flex-row space-x-2 items-center">
                <StorageIcon /> <span>512GB</span>
              </p>
            </CardContent>
            <CardFooter className="flex flex-row justify-between items-center opacity-75 text-balance">
              <p className="text-sm">Apple iMac（2021）</p>
              <div>
                <MacIcon />
              </div>
            </CardFooter>
          </Card>

          <Card>
            <CardContent className="font-medium flex flex-col space-y-2">
              <p className="flex flex-row space-x-2 items-center">
                <CPUIcon /> <span>英特尔® 酷睿™ i9-14900HX</span>
              </p>
              <p className="flex flex-row space-x-2 items-center">
                <GraphicsIcon /> <span>Nvidia GeForce RTX 5070</span>
              </p>
              <p className="flex flex-row space-x-2 items-center">
                <RAMIcon /> <span>32GB</span>
              </p>
              <p className="flex flex-row space-x-2 items-center">
                <StorageIcon /> <span>1TB</span>
              </p>
            </CardContent>
            <CardFooter className="flex flex-row justify-between items-center opacity-75 text-balance">
              <p className="text-sm">惠普 暗影精灵 11（2025）</p>
              <div>
                <LaptopIcon />
              </div>
            </CardFooter>
          </Card>
        </div>

        <h1 className="font-bold text-2xl mt-12 mb-6">联系我</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <CardContent className="font-medium flex flex-col space-y-2">
              <p className="flex flex-row space-x-2 items-center">
                <UserIcon /> <span>耿越</span>
              </p>
              <p className="flex flex-row space-x-2 items-center">
                <LinkIcon />{" "}
                <a href="https://github.com/gengyue2468">@gengyue2468</a>
              </p>
            </CardContent>
            <CardFooter className="flex flex-row justify-between items-center opacity-75 text-balance">
              <p className="text-sm">GitHub 账户</p>
              <div>
                <GitHubIcon />
              </div>
            </CardFooter>
          </Card>
          <Card>
            <CardContent className="font-medium flex flex-col space-y-2">
              <p className="flex flex-row space-x-2 items-center">
                <UserIcon /> <span>耿越</span>
              </p>
              <p className="flex flex-row space-x-2 items-center">
                <LinkIcon />{" "}
                <a href="mailto:gengyue2468@outlook.com">
                  gengyue2468@outlook.com
                </a>
              </p>
            </CardContent>
            <CardFooter className="flex flex-row justify-between items-center opacity-75 text-balance">
              <p className="text-sm">电子邮件</p>
              <div>
                <EmailIcon />
              </div>
            </CardFooter>
          </Card>
          <Card>
            <CardContent className="font-medium flex flex-col space-y-2">
              <p className="flex flex-row space-x-2 items-center">
                <LinkIcon /> gengyue2468
              </p>
            </CardContent>
            <CardFooter className="flex flex-row justify-between items-center opacity-75 text-balance">
              <p className="text-sm">微信</p>
              <div>
                <WeChatIcon />
              </div>
            </CardFooter>
          </Card>
          <Card>
            <CardContent className="font-medium flex flex-col space-y-2">
              <p className="flex flex-row space-x-2 items-center">
                <LinkIcon /> 3041299667
              </p>
            </CardContent>
            <CardFooter className="flex flex-row justify-between items-center opacity-75 text-balance">
              <p className="text-sm">腾讯QQ</p>
              <div>
                <QQIcon />
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
