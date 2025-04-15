"use client";

import Image from "next/image";
import Logo from "@/assets/Logo.svg";
import Link from "next/link";
import {
  faBars,
  faBookmark,
  faCompress,
  faFileCode,
  faFileExcel,
  faFileHalfDashed,
  faFileImage,
  faFilePowerpoint,
  faFileWord,
  faHome,
  faImage,
  faListOl,
  faLock,
  faLockOpen,
  faObjectGroup,
  faRotate,
  IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ptJson from "@/translate/pt.json";
import { useRouter } from "next/navigation";

const nav = [
  {
    label: ptJson.compress_pdf,
    path: "/compress",
  },
  {
    label: ptJson.merge_pdf,
    path: "/merge",
  },
  {
    label: ptJson.split_pdf,
    path: "/split",
  },
];

const fullNav: {
  path: string;
  label: string;
  iconProps: {
    icon: IconDefinition;
    color: string;
  };
}[] = [
  {
    label: ptJson.start_page,
    path: "/",
    iconProps: {
      color: "text-primary",
      icon: faHome,
    },
  },
  {
    label: ptJson.compress_pdf,
    path: "/compress",
    iconProps: {
      color: "text-green-600",
      icon: faCompress,
    },
  },
  {
    label: ptJson.merge_pdf,
    path: "/merge",
    iconProps: {
      color: "text-cyan-600",
      icon: faObjectGroup,
    },
  },
  {
    label: ptJson.split_pdf,
    path: "/split",
    iconProps: {
      color: "text-emerald-600",
      icon: faFileHalfDashed,
    },
  },
  {
    label: ptJson.image_to_pdf,
    path: "/convert-images-to-pdf",
    iconProps: {
      color: "text-yellow-600",
      icon: faImage,
    },
  },
  {
    label: ptJson.word_pdf,
    path: "/word-to-pdf",
    iconProps: {
      color: "text-blue-600",
      icon: faFileWord,
    },
  },
  {
    label: ptJson.excel_pdf,
    path: "/excel-to-pdf",
    iconProps: {
      color: "text-green-600",
      icon: faFileExcel,
    },
  },
  {
    label: ptJson.powerpoint_pdf,
    path: "/powerpoint-to-pdf",
    iconProps: {
      color: "text-orange-600",
      icon: faFilePowerpoint,
    },
  },
  {
    label: ptJson.pdf_jpg,
    path: "/pdf-to-jpg",
    iconProps: {
      color: "text-indigo-600",
      icon: faFileImage,
    },
  },
  {
    label: ptJson.rotate_pdf,
    path: "/rotate-pdf",
    iconProps: {
      color: "text-teal-600",
      icon: faRotate,
    },
  },
  {
    label: ptJson.add_page_number_pdf,
    path: "/add-page-number",
    iconProps: {
      color: "text-rose-600",
      icon: faListOl,
    },
  },
  {
    label: ptJson.add_watermark_pdf,
    path: "/watermark",
    iconProps: {
      color: "text-amber-600",
      icon: faBookmark,
    },
  },
  {
    label: ptJson.lock_pdf,
    path: "/lock",
    iconProps: {
      color: "text-pink-600",
      icon: faLock,
    },
  },
  {
    label: ptJson.unlock_pdf,
    path: "/unlock",
    iconProps: {
      color: "text-violet-600",
      icon: faLockOpen,
    },
  },
];

export default function Header() {
  const router = useRouter();

  return (
    <div className="h-24 bg-base-300 px-6 md:px-10 flex items-center justify-between">
      <div onClick={() => router.push("/")} className="cursor-pointer">
        <Image src={Logo} alt="CODE-PDF" className="rounded" />
      </div>

      <nav className="grid grid-cols-[1fr_auto]">
        <ul className="md:flex gap-4 items-center hidden">
          {nav.map((route, i) => (
            <li key={i}>
              <Link
                href={route.path}
                className="px-3 py-2 text-sm break-keep font-medium uppercase tracking-wide text-gray-200 transition-all hover:text-primary
                 duration-200"
              >
                {route.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="drawer z-50">
          <input id="my-drawer" type="checkbox" className="drawer-toggle" />
          <div className="drawer-content">
            <label
              title="Abrir menu"
              htmlFor="my-drawer"
              className="btn btn-icon drawer-button bg-transparent border-none py-2"
            >
              <FontAwesomeIcon
                icon={faBars}
                className="text-4xl text-primary"
              />
            </label>
          </div>
          <div className="drawer-side">
            <label
              htmlFor="my-drawer"
              aria-label="close sidebar"
              className="drawer-overlay"
            ></label>
            <ul className="menu bg-base-200 text-base-content min-h-full w-80 p-4">
              <li onClick={() => router.push("/")}>
                <div className="pb-5 mb-8 border-b hover:bg-transparent border-b-gray-50 rounded-none flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={faFileCode}
                    className="text-2xl text-gray-50"
                  />
                  <span className="text-2xl font-medium text-gray-50">
                    codepdf
                  </span>
                </div>
              </li>
              {/* Sidebar content here */}
              {fullNav.map((route, i) => {
                return (
                  <li onClick={() => router.push(route.path)} key={i}>
                    <div className="grid grid-cols-[auto_1fr] items-center gap-3 mb-5">
                      <FontAwesomeIcon
                        icon={route.iconProps.icon}
                        className={`${route.iconProps.color} text-xl`}
                      />

                      <span className="block text-sm tracking-wide font-medium text-gray-50">
                        {route.label}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
}
