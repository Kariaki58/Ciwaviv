import Image from 'next/image';

export default function Logo() {
  return <Image src="/fithub-logo.png" alt="Fithub logo" width={100} height={28} className="text-primary" />;
}
