type Props = {
  username: string;
}

export const UserAvatar = ({ username }: Props) => {
  return (
    <div className="hidden 2xl:flex bg-gray-900 text-white h-[2em] w-[2em] aspect-square rounded-full float-left  items-center justify-center text-2xl">{username.charAt(0).toUpperCase()}</div>
  )
};
