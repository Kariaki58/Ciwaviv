import Image from 'next/image';

export default function Logo() {
  return <Image src="/logo.svg" alt="Ciwaviv logo" width={100} height={28} className="text-primary" />;
}
