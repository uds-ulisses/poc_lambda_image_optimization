import Image from "next/image";

const cdnLoader = ({ src }) => {
  return `https://d23ar4ov1rgqm6.cloudfront.net/w_800,h_400/${src}`;
};

export default function Home() {
  return (
    <div>
      <h1>POC Otimização de Imagens</h1>
      <Image
        loader={cdnLoader}
        src="estrella.png"
        width={400}
        height={300}
        alt="exemplo"
      />
    </div>
  );
}
